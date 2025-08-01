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
const analytics_controller_1 = __importDefault(require("../controllers/analytics.controller"));
class Analytics {
    static getAnalytics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield analytics_controller_1.default.getAnalytics(req);
                const statusCode = response.success ? 200 : 400;
                return res.status(statusCode).json(response);
            }
            catch (error) {
                console.error("Error in Analytics service:", error);
                return res.status(500).json({
                    success: false,
                    message: "Internal server error in analytics service",
                    error: error instanceof Error ? error.message : "Unknown error"
                });
            }
        });
    }
}
exports.default = Analytics;
//# sourceMappingURL=analytics.services.js.map