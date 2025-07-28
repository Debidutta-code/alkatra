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
exports.decodeToken = exports.assignToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const expiresInSeconds = (days) => days * 24 * 60 * 60;
const assignToken = (payload, secret, expiresIn) => {
    return jsonwebtoken_1.default.sign(payload, secret, {
        expiresIn: expiresInSeconds(parseInt(expiresIn === null || expiresIn === void 0 ? void 0 : expiresIn.split("d")[0])),
    });
};
exports.assignToken = assignToken;
const decodeToken = (token, secret) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(token, secret, (err, decoded) => {
            if (err)
                reject(err);
            resolve(decoded);
        });
    });
});
exports.decodeToken = decodeToken;
//# sourceMappingURL=jwtHelper.js.map