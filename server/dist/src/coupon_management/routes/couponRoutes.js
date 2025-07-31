"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const couponController_1 = require("../controller/couponController");
const authMiddleware_1 = require("../../customer_authentication/src/middleware/authMiddleware");
const router = express_1.default.Router();
router.route('/generate').post(couponController_1.generateCouponCode);
router.route('/get/:code').get(authMiddleware_1.authenticateCustomer, couponController_1.getCouponDetails);
router.route('/validate').post(authMiddleware_1.authenticateCustomer, couponController_1.validateCouponCode);
exports.default = router;
//# sourceMappingURL=couponRoutes.js.map