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
exports.AuthService = void 0;
const googleAuthRepository_1 = require("../repositories/googleAuthRepository");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class AuthService {
    constructor() {
        this.repository = new googleAuthRepository_1.AuthRepository();
    }
    handleGoogleAuth(profile) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this.repository.findUserByGoogleId(profile.id);
            if (!user) {
                user = yield this.repository.createUser({
                    googleId: profile.id,
                    displayName: profile.displayName,
                    email: profile.emails,
                    avatar: profile.avatar,
                });
            }
            const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET_KEY || "your-secret-key", { expiresIn: "7d" });
            return { user, token };
        });
    }
    getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.repository.findUserById(id);
        });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=googleAuthService.js.map