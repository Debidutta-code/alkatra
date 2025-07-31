"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const router = (0, express_1.Router)();
// Payment intent routes
router.route("/create-payment-intent").post(payment_controller_1.createPaymentIntent);
router.route("/create-setup-intent").post(payment_controller_1.createSetupIntent);
exports.default = router;
//# sourceMappingURL=payment.routes.js.map