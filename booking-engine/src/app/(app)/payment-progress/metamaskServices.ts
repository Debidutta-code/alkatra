import { ethers, Contract, BrowserProvider, parseUnits } from 'ethers';
import { number } from 'prop-types';
import toast from 'react-hot-toast';

const ERC20_ABI = [
  "function transfer(address to, uint256 value) public returns (bool)",
  "function decimals() public view returns (uint8)",
  "function balanceOf(address owner) public view returns (uint256)",
];

export async function sendToken(
  walletClient: any,
  selectedChain: any,
  selectedToken: string,
  amount: number,
  recipientAddress: string,
  chainId: number,
  selectedChainId: number | null,
  contaractAddress: string
) {
  try {
    const provider = new BrowserProvider(walletClient.transport);
    const signer = await provider.getSigner();

    if (chainId !== Number(selectedChainId)) {
      toast.error(`Chain mismatch: Please switch to ${selectedChain}`);
      return;
    }

    const tokenContract = new Contract(contaractAddress, ERC20_ABI, signer);
    const decimals = await tokenContract.decimals();
    const parsedAmount = parseUnits(amount.toString(), decimals);

    const balance = await tokenContract.balanceOf(await signer.getAddress());
    if (balance < parsedAmount) {
      toast.error(`Insufficient ${selectedToken} balance`);
      return;
    }

    toast.loading("Sending transaction...");

    const tx = await tokenContract.transfer(recipientAddress, parsedAmount);
    toast.dismiss();
    toast.success(`Transaction sent: ${tx.hash.slice(0, 10)}...`);

    const receipt = await tx.wait();
    toast.success("Transaction confirmed");

    return receipt;

  } catch (error: any) {
    toast.dismiss();

    if (error.code === 'CALL_EXCEPTION') {
      toast.error(error.reason || "Transaction failed");
    } else if (error.code === 4001) {
      toast.error("Transaction rejected by user");
    } else if (error.message?.includes("insufficient funds")) {
      toast.error("Insufficient balance for gas fees");
    } else if (error.code === -32603 || error?.message?.includes("Internal JSON-RPC error")) {
      toast.error("Internal error while processing transaction. Please check network, token address, and gas settings.");
    } else {
      console.error("sendToken error:", error);
      toast.error(error.reason || error.message || "Unknown error occurred");
    }

    throw error;
  }
}
