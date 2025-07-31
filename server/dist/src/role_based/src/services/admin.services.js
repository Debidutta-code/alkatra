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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminServices = void 0;
const adminController_1 = require("../controllers/adminController");
class AdminServices {
    static getHotelManagersHotel(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield adminController_1.AdminController.getHotelManagersHotel(req);
                console.log(response);
                return res.status(200).json(response);
            }
            catch (error) {
                console.log(error === null || error === void 0 ? void 0 : error.message);
            }
        });
    }
}
exports.AdminServices = AdminServices;
//# sourceMappingURL=admin.services.js.map