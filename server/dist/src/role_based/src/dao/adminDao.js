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
exports.AdminDao = void 0;
const auth_model_1 = __importDefault(require("../../../user_authentication/src/Model/auth.model"));
const property_info_model_1 = require("../../../property_management/src/model/property.info.model");
class AdminDao {
    static getHotelManagersHotel(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield auth_model_1.default.findOne({ _id: id });
                return result;
            }
            catch (error) {
                throw new Error(error.message);
            }
        });
    }
    static getPropertyDetails(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const property = yield property_info_model_1.PropertyInfo.findOne({ user_id: id }).select("property_name _id").lean();
            return property;
        });
    }
}
exports.AdminDao = AdminDao;
//# sourceMappingURL=adminDao.js.map