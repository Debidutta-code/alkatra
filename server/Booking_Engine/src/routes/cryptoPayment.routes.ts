import { Router } from "express";
import { cryptoPaymentInitiate, currencyConversion, getCryptoDetails, pushCryptoPaymentDetails, storeGuestDetailsForCryptoPayment } from "../controllers/crypto.controller";
import { authenticateCustomer } from "../../../Customer-Authentication/src/middleware/authMiddleware";

const router = Router();

router.route("/crypto-payment-initiate").post(authenticateCustomer as any, cryptoPaymentInitiate);
router.route("/crypto-details").get(authenticateCustomer as any, getCryptoDetails);
router.route("/push-crypto-payment").post(pushCryptoPaymentDetails);
router.route("/currency-conversion").post(authenticateCustomer as any, currencyConversion);
router.route("/guest-details-initiate").post(authenticateCustomer as any, storeGuestDetailsForCryptoPayment)

export default router;