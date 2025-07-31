"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const customerController_1 = __importDefault(require("../../controllers/customerController"));
const verificationOtp_controller_1 = __importDefault(require("../../controllers/verificationOtp.controller"));
const sms_controller_1 = require("../../controllers/sms.controller");
const router = (0, express_1.Router)();
const smsController = new sms_controller_1.SMSController();
router.post("/register", customerController_1.default.registerCustomer);
router.post("/login", customerController_1.default.loginCustomer);
router.get("/all", authMiddleware_1.authenticateCustomer, customerController_1.default.getAllCustomers);
router.get("/me", authMiddleware_1.authenticateCustomer, customerController_1.default.getCustomerOwnData);
router.patch("/update", authMiddleware_1.authenticateCustomer, customerController_1.default.updateCustomerProfile);
router.post("/verify-email", customerController_1.default.checkEmailExists);
router.patch("/reset-password", customerController_1.default.updatePassword);
router.post('/send-otp', verificationOtp_controller_1.default.sendOTP);
router.post('/verify-otp', verificationOtp_controller_1.default.verifyOTP);
router.post('/send-sms', smsController.sendSMS);
exports.default = router;
//# sourceMappingURL=customerRoutes.js.map