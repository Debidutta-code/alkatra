import { Router } from "express";
import { cryptoPaymentInitiate, currencyConversion, getCryptoDetails, getInitiatedPaymentDetails, getPaymentSuccessResponse, getWalletAddress, pushCryptoPaymentDetails, storeGuestDetailsForCryptoPayment } from "../controllers/crypto.controller";
import { authenticateCustomer } from "../../../customer_authentication/src/middleware/authMiddleware";

const router = Router();

router.route("/crypto-payment-initiate").post(authenticateCustomer as any, cryptoPaymentInitiate as any);
router.route("/get-crypto-initiated-payment").get(authenticateCustomer as any, getInitiatedPaymentDetails);
router.route("/crypto-details").get(authenticateCustomer as any, getCryptoDetails);
router.route("/push-crypto-payment").post(pushCryptoPaymentDetails);
router.route("/currency-conversion").post(authenticateCustomer as any, currencyConversion);
router.route("/guest-details-initiate").post(authenticateCustomer as any, storeGuestDetailsForCryptoPayment);
router.route("/wallet-address").get(authenticateCustomer as any, getWalletAddress);
router.route("/get-payment-status").get(authenticateCustomer as any, getPaymentSuccessResponse)

export default router;