// "use client";

import React from "react";
import { useTranslation } from "react-i18next";
import Cookies from "js-cookie";
import axios from "axios";
import { useState, useEffect } from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useChains,useSwitchChain,useAccount } from "wagmi";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setPaymentData } from "@/Redux/slices/payment.slice";


// interface CryptoToken {
//   name: string;
//   imageUrl: string;
//   chainId: number;
//   contractAddress: string;
// }

// interface BookingDetails {
//   roomId: string;
//   propertyId: string;
//   amount: string;
//   currency: string;
//   checkIn: string;
//   checkOut: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   userId: string;
//   hotelName: string;
//    hotelCode: string ;
//   ratePlanCode: string;
//   roomType: string;
//   rooms: number;
//   adults: number;
//   children: number;
//   infants: number;
//   guests: Array<{
//     firstName: string;
//     lastName: string;
//     dob?: string;
//     type?: "adult" | "child" | "infant";
//   }>;
//   paymentOption: string | null;
// }

// interface PayWithCryptoWalletProps {
//   bookingDetails: BookingDetails;
//   onConvertedAmountChange?: (amount: number | null) => void;
// }

interface CryptoToken {
  name: string;
  imageUrl: string;
}


const PayWithCryptoWallet: React.FC<PayWithCryptoWalletProps> = ({ bookingDetails, onConvertedAmountChange }) => {
  const { t, i18n } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [tokens, setTokens] = useState<CryptoToken[]>([]);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [selectedChainId, setSelectedChainId] = useState<number >(0);
  const [networkLoading, setNetworkLoading] = useState<boolean>(false);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [networks, setNetworks] = useState<CryptoToken[]>([]);
  const [paymentInitiated, setPaymentInitiated] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [contractAddress, setContractAddress] = useState<string >("");
  const router = useRouter();
  const { switchChain } = useSwitchChain();
  const {isConnected} = useAccount();
   const dispatch=useDispatch();

  // Fetch crypto token list from API
  useEffect(() => {
    const fetchCryptoTokens = async () => {
      try {
        const token = Cookies.get("accessToken");
        if (!token) {
          setError(t("PayWithCryptoWallet.errors.noAuthToken"));
          setLoading(false);
          return;
        }

//         const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/crypto/crypto-details`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         });

//         const data = response.data;

        if ((data.success || data.message) && Array.isArray(data.data)) {
          setTokens(data.data);
        } else {
          setError(t("PayWithCryptoWallet.errors.fetchTokens"));
        }
        setLoading(false);
      } catch (err) {
        setError(t("PayWithCryptoWallet.errors.fetchTokensError"));
        setLoading(false);
      }
    };

//     fetchCryptoTokens();
//   }, [t]);

//   // Fetch networks when a token is selected
//   const fetchNetworks = async (tokenName: string) => {
//     setNetworkLoading(true);
//     setSelectedNetwork(null);
//     // setSelectedChainId(0);
    
    setConvertedAmount(null); 
    try {
      const token = Cookies.get("accessToken");
      if (!token) {
        setError(t("PayWithCryptoWallet.errors.noAuthToken"));
        return;
      }

//       const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/crypto/crypto-details?token=${tokenName}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       const data = response.data;

      if ((data.success || data.message) && Array.isArray(data.data)) {
        setNetworks(data.data);
      } else {
        setError(t("PayWithCryptoWallet.errors.fetchNetworks"));
      }
    } catch (err) {
      setError(t("PayWithCryptoWallet.errors.fetchNetworksError"));
    } finally {
      setNetworkLoading(false);
    }
  };



//   // Convert currency after network selection
//   useEffect(() => {
//     const convertCurrency = async () => {
//       if (!selectedNetwork || !bookingDetails.amount || !bookingDetails.currency) return;

//       setIsProcessing(true);
//       setError(null);

      try {
        const token = Cookies.get("accessToken");
        if (!token) {
          setError(t("PayWithCryptoWallet.errors.noAuthToken"));
          return;
        }

//         const response = await axios.post(
//           `${process.env.NEXT_PUBLIC_BACKEND_URL}/crypto/currency-conversion`,
//           {
//             currency: bookingDetails.currency,
//             amount: parseFloat(bookingDetails.amount),
//           },
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         const data = response.data;

        if (data.success || data.message) {
          const amount = Number(data.data.convertedAmount);
          if (isNaN(amount)) {
            setError(t("PayWithCryptoWallet.errors.invalidConvertedAmount"));
            onConvertedAmountChange?.(null);
            return;
          }
          setConvertedAmount(amount);
          onConvertedAmountChange?.(amount);
        } else {
          setError(data.message || t("PayWithCryptoWallet.errors.currencyConversion"));
          onConvertedAmountChange?.(null);
        }
      } catch (err) {
        setError(t("PayWithCryptoWallet.errors.currencyConversionError"));
        onConvertedAmountChange?.(null);
      } finally {
        setIsProcessing(false);
      }
    };

//     convertCurrency();
//   }, [selectedNetwork, bookingDetails.amount, bookingDetails.currency, t, onConvertedAmountChange]);

  useEffect(()=>{
    if (selectedChainId !== undefined && selectedChainId !== null) {
      localStorage.setItem("selectedChainId", selectedChainId.toString());
    }
    localStorage.setItem("contractAddress",contractAddress);
  },[selectedChainId])

  // Initiate crypto payment
  const initiatePayment = async () => {
    if (!selectedToken || !selectedNetwork || !convertedAmount) {
      setError(t("PayWithCryptoWallet.errors.selectionIncomplete"));
      return;
    }
    if(!isConnected){
      toast.error("Plese connect wallet to continue");
      return;
    }

//     setIsProcessing(true);
//     setError(null);

    try {
      const token = Cookies.get("accessToken");
      if (!token) {
        setError(t("PayWithCryptoWallet.errors.noAuthToken"));
        return;
      }

//       // Step 1: Initiate crypto payment
//       const paymentResponse = await axios.post(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/crypto/crypto-payment-initiate`,
//         {
//           token: selectedToken,
//           blockchain: selectedNetwork,
//           currency: bookingDetails.currency,
//           amount: convertedAmount,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const paymentDataResponse = paymentResponse.data;

      if (paymentDataResponse.success || paymentDataResponse.message) {
        dispatch(setPaymentData(paymentDataResponse.data))
        setPaymentInitiated(true);

//         console.log("convertedAmount:", convertedAmount, "Type:", typeof convertedAmount);

//         // Step 2: Call guest-details-initiate API
//         try {
//           const guestDetailsResponse = await axios.post(
//             `${process.env.NEXT_PUBLIC_BACKEND_URL}/crypto/guest-details-initiate`,
//             {
//               checkInDate: bookingDetails.checkIn,
//               checkOutDate: bookingDetails.checkOut,
//               hotelCode: bookingDetails.hotelCode || "WINCLOUD",
//               hotelName: bookingDetails.hotelName,
//               ratePlanCode: bookingDetails.ratePlanCode,
//               numberOfRooms: bookingDetails.rooms,
//               roomTypeCode: bookingDetails.roomType,
//               roomTotalPrice: parseFloat(paymentDataResponse.data.amount.toFixed(2)),
//               currencyCode: bookingDetails.currency,
//               email: bookingDetails.email,
//               phone: bookingDetails.phone,
//               guests: bookingDetails.guests,
              
//             },
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//                 "Content-Type": "application/json",
//               },
//             }
//           );

//           const guestDetailsData = guestDetailsResponse.data;

//           if (guestDetailsData.success || guestDetailsData.message) {
//             console.log("Guest details submitted successfully:", guestDetailsData);

//             // Step 3: Fetch wallet address
//             try {
//               const walletResponse = await axios.get(
//                 `${process.env.NEXT_PUBLIC_BACKEND_URL}/crypto/wallet-address`,
//                 {
//                   headers: {
//                     Authorization: `Bearer ${token}`,
//                     "Content-Type": "application/json",
//                   },
//                 }
//               );

//               const walletData = walletResponse.data;

              if (walletData.success && walletData.address?.[0]?.wallet_address) {
                // Update paymentData with wallet address and guest details
                const updatedPaymentData = {
                  ...paymentDataResponse.data,
                  address: walletData.address[0].wallet_address,
                  checkInDate: bookingDetails.checkIn,
                  checkOutDate: bookingDetails.checkOut,
                  hotelCode: bookingDetails.hotelCode || "WINCLOUD",
                  hotelName: bookingDetails.hotelName,
                  ratePlanCode: bookingDetails.ratePlanCode,
                  numberOfRooms: bookingDetails.rooms,
                  roomTypeCode: bookingDetails.roomType,
                  currencyCode: bookingDetails.currency,
                  email: bookingDetails.email,
                  phone: bookingDetails.phone,
                  guests: bookingDetails.guests,
                  paymentOption:bookingDetails.paymentOption,
                };
                
                dispatch(setPaymentData(updatedPaymentData));
                // Navigate to payment progress page only after all APIs succeed
                router.push("/payment-progress");
              } else {
                setError(t("PayWithCryptoWallet.errors.fetchWalletAddress"));
                console.error("Failed to fetch wallet address:", walletData.message);
              }
            } catch (walletError) {
              setError(t("PayWithCryptoWallet.errors.fetchWalletAddressError"));
              console.error("Wallet address fetch error:", walletError);
            }
          } else {
            setError(guestDetailsData.message || t("PayWithCryptoWallet.errors.guestDetails"));
            console.error("Guest details submission failed:", guestDetailsData.message);
          }
        } catch (guestError) {
          setError(t("PayWithCryptoWallet.errors.guestDetailsError"));
          console.error("Guest details initiation error:", guestError);
        }
      } else {
        setError(paymentDataResponse.message || t("PayWithCryptoWallet.errors.initiatePayment"));
      }
    } catch (err) {
      setError(t("PayWithCryptoWallet.errors.initiatePaymentError"));
    } finally {
      setIsProcessing(false);
    }
  };

//   // Handle token selection
//   const handleTokenSelect = async (tokenName: string) => {
//     setSelectedToken(tokenName);
//     await fetchNetworks(tokenName);
//   };

//   // Handle network selection
//   const handleNetworkSelect = (networkName: string,chainId:number,contractAddress:string) => {
//     if(!isConnected){
//       toast.error("Please connect your wallet to continue");
//       return;
//     }
//     setSelectedNetwork(networkName);
//     setSelectedChainId(chainId);
//     setContractAddress(contractAddress);
//     switchChain({ chainId: Number(chainId) });
//   };
  

//   return (
//     <div className="bg-tripswift-off-white p-6 rounded-lg ">

//       <div className="mb-4 flex justify-between text-start">
        
//         <div className=" ">
//           <ConnectButton
//             accountStatus="address"
//             chainStatus="icon"
//             showBalance={false}
//             label="Connect Wallet"
//           />
//         </div>
//       </div>
     


      <div className={`pay-with-crypto-qr p-6 bg-white rounded-xl border border-gray-100 ${i18n.language === "ar" ? "text-right" : "text-left"}`}>
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-tripswift-blue/20 border-t-tripswift-blue rounded-full animate-spin"></div>
              <div className="absolute inset-1.5 w-9 h-9 border-4 border-transparent border-r-tripswift-blue/40 rounded-full animate-spin"
                style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <span className="mt-3 text-sm text-gray-500">
              {t("PayWithCryptoWallet.loadingTokens")}
            </span>
          </div>
        )}

//         {/* Error State */}
//         {error && (
//           <div className="p-3 mb-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
//             <svg className="w-4 h-4 mt-0.5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//             <span className="text-sm text-red-600">{error}</span>
//           </div>
//         )}

        {/* Token Selection */}
        {!loading && !error && tokens.length  > 0 && isConnected && (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {t("PayWithCryptoWallet.selectToken")}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {tokens.map((token) => (
                  <button
                    key={token.name}
                    onClick={() => handleTokenSelect(token.name)}
                    disabled={paymentInitiated}
                    className={`flex flex-col items-center p-3 rounded-lg transition-all border ${selectedToken === token.name
                      ? "border-tripswift-blue bg-tripswift-blue/10 "
                      : "border-gray-200 hover:bg-gray-50"
                      }`}
                  >
                    <div className="relative w-8 h-8 mb-2">
                      <Image
                        src={token.imageUrl}
                        alt={t("PayWithCryptoWallet.tokenLogoAlt", { token: token.name })}
                        fill
                        className="rounded-full object-contain"
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-800">
                      {token.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Network Selection */}
            {selectedToken && (
              <div className="pt-2">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  {t("PayWithCryptoWallet.selectNetwork")}
                </h4>
                {networkLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-500 mr-2" />
                    <span className="text-sm text-gray-500">
                      {t("PayWithCryptoWallet.loadingNetworks")}
                    </span>
                  </div>
                ) : networks.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {networks.map((network) => (
                      <button
                        key={network.name}
                        onClick={() => {handleNetworkSelect(network.name,network.chainId,network.contractAddress) ; switchChain({chainId: network.chainId }); } }
                        disabled={paymentInitiated}
                        className={`flex flex-col items-center p-3 rounded-lg transition-all border ${selectedNetwork === network.name
                          ? "border-tripswift-blue bg-tripswift-blue/10 shadow-sm"
                          : "border-gray-200 hover:bg-gray-50"
                          }`}
                      >
                        <div className="relative w-8 h-8 mb-2">
                          <Image
                            src={network.imageUrl}
                            alt={t("PayWithCryptoWallet.networkLogoAlt", { network: network.name })}
                            fill
                            className="rounded-full object-contain"
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-800">
                          {network.name}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-center">
                    <span className="text-sm text-gray-500">
                      {t("PayWithCryptoWallet.noNetworksAvailable")}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Conversion Status */}
            {selectedNetwork && isProcessing && (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500 mr-2" />
                  <span className="text-sm text-blue-700">
                    {t("PayWithCryptoWallet.convertingCurrency", { currency: bookingDetails.currency.toUpperCase() })}
                  </span>
                </div>
              </div>
            )}

//             {/* Payment Button */}
            
            {selectedToken && selectedNetwork && convertedAmount && !paymentInitiated && (
              <button
                onClick={initiatePayment}
                disabled={isProcessing}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${isProcessing
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-tripswift-blue text-white hover:bg-tripswift-blue-dark shadow-sm hover:shadow-md'
                  }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t("PayWithCryptoWallet.processing")}
                  </div>
                ) : (
                  t("PayWithCryptoWallet.initiatePayment")
                )}
              </button>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && tokens.length === 0 && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
            <span className="text-sm text-gray-500">
              {t("PayWithCryptoWallet.noTokensAvailable")}
            </span>
          </div>
        )}
      </div>

//     </div>
//   );
// };

// export default PayWithCryptoWallet;