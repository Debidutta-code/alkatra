"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const crypto_controller_1 = require("../controllers/crypto.controller");
const authMiddleware_1 = require("../../../customer_authentication/src/middleware/authMiddleware");
const router = (0, express_1.Router)();
router.route("/crypto-payment-initiate").post(authMiddleware_1.authenticateCustomer, crypto_controller_1.cryptoPaymentInitiate);
router.route("/get-crypto-initiated-payment").get(authMiddleware_1.authenticateCustomer, crypto_controller_1.getInitiatedPaymentDetails);
router.route("/crypto-details").get(authMiddleware_1.authenticateCustomer, crypto_controller_1.getCryptoDetails);
router.route("/push-crypto-payment").post(crypto_controller_1.pushCryptoPaymentDetails);
router.route("/currency-conversion").post(authMiddleware_1.authenticateCustomer, crypto_controller_1.currencyConversion);
router.route("/guest-details-initiate").post(authMiddleware_1.authenticateCustomer, crypto_controller_1.storeGuestDetailsForCryptoPayment);
router.route("/wallet-address").get(authMiddleware_1.authenticateCustomer, crypto_controller_1.getWalletAddress);
router.route("/get-payment-status").get(authMiddleware_1.authenticateCustomer, crypto_controller_1.getPaymentSuccessResponse);
exports.default = router;
//# sourceMappingURL=cryptoPayment.routes.js.map