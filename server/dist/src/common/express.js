"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeExpressRoutes = initializeExpressRoutes;
const appError_1 = require("../property_management/src/utils/appError");
const error_middleware_1 = require("../property_management/src/middlewares/error.middleware");
// route imports
const rolebased_route_1 = __importDefault(require("../role_based/src/routes/rolebased.route"));
const auth_route_1 = __importDefault(require("../user_authentication/src/Routes/auth.route"));
const api_1 = __importDefault(require("../property_management/src/api"));
const user_route_1 = __importDefault(require("../user_authentication/src/Routes/user.route"));
const route_1 = __importDefault(require("../wincloud/src/api/route"));
const customerRoutes_1 = __importDefault(require("../customer_authentication/src/api/routes/customerRoutes"));
const booking_routes_1 = __importDefault(require("../booking_engine/src/routes/booking.routes"));
const payment_routes_1 = __importDefault(require("../booking_engine/src/routes/payment.routes"));
const cryptoPayment_routes_1 = __importDefault(require("../booking_engine/src/routes/cryptoPayment.routes"));
const ratePlan_route_1 = __importDefault(require("../rate_plan/src/routes/ratePlan.route"));
const couponRoutes_1 = __importDefault(require("../coupon_management/routes/couponRoutes"));
const notification_route_1 = __importDefault(require("../notification/src/route/notification.route"));
const googleAuthRoute_1 = __importDefault(require("../customer_authentication/src/api/routes/googleAuthRoute"));
function initializeExpressRoutes(_a) {
    return __awaiter(this, arguments, void 0, function* ({ app }) {
        app.head("/status", (_, res) => res.status(200).end());
        // Authentication
        app.use("/api/v1/auth", auth_route_1.default);
        app.use("/api/v1/user", user_route_1.default);
        app.use("/api/v1/customers", customerRoutes_1.default);
        // Google Auth
        app.use("/api/v1/google", googleAuthRoute_1.default);
        // PMS
        app.use("/api/v1/pms", (0, api_1.default)());
        // amadeus hotel routes
        app.use("/api/v1/room", route_1.default);
        app.use("/api/v1/booking", booking_routes_1.default);
        app.use("/api/v1/payment", payment_routes_1.default);
        // crypto payment routes
        app.use("/api/v1/crypto", cryptoPayment_routes_1.default);
        app.use("/api/v1/rate-plan", ratePlan_route_1.default);
        // Coupon managemen api
        app.use("/api/v1/coupon", couponRoutes_1.default);
        app.use("/api/v1/admin", rolebased_route_1.default);
        app.use("/api/v1/notification", notification_route_1.default);
        app.all("*", (req, _res, next) => {
            next(new appError_1.AppError(`Can't find ${req.originalUrl} path on the server`, 404));
        });
        app.use(error_middleware_1.errorHandler);
    });
}
//# sourceMappingURL=express.js.map