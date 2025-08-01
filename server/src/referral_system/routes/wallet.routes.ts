import { Router } from "express";
import { walletController } from "../container";
import { authenticateCustomer } from "../../customer_authentication/src/middleware/authMiddleware";

const router = Router();

/**
 * @POST /wallet/create
 * Creates a wallet for the user.
 * @body { userId: string }
 */
router.post("/create", walletController.handleWalletCreation);

/** * @POST /wallet/modify
 * Modifies the balance of a user's wallet.
 * @body { userId: string, amount: number }
 */
router.post("/reward", walletController.handleBalanceIncrement.bind(walletController));

/**
 * @POST /wallet/redeem
 * Redeems a specified amount from the user's wallet.
 * @body { userId: string, amount: number }
 */
router.post("/redeem", authenticateCustomer, walletController.handleRedeemption.bind(walletController));

/**
 * @GET /wallet/:userId
 * Retrieves the wallet of a specific user.
 * @param userId - The ID of the user
 */
router.get("/", authenticateCustomer, walletController.handleFetchWallet.bind(walletController));

export { router as WalletRoutes };