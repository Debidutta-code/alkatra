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
exports.ApiClient = void 0;
const axios_1 = __importDefault(require("axios"));
const flatted_1 = require("flatted");
class ApiClient {
    sendToThirdParty(xml) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // console.log('Sending XML to third-party API:', xml);
                const apiUrl = process.env.WINCLOUD_TEST_API;
                if (!apiUrl) {
                    throw new Error('WINCLOUD_TEST_API environment variable is not defined');
                }
                console.log('Third-party API URL:', apiUrl);
                const apiResponse = yield axios_1.default.post(apiUrl, xml, {
                    headers: { 'Content-Type': 'text/xml' },
                });
                console.log("API Response:", (0, flatted_1.stringify)(apiResponse));
                console.log("→ Status:", apiResponse.status);
                console.log("→ Status Text:", apiResponse.statusText);
                console.log("→ Headers:", apiResponse.headers);
                console.log("→ Data:", apiResponse.data);
                if (apiResponse.status !== 200) {
                    throw new Error(`Third-party API responded with status code ${apiResponse.status}`);
                }
                // Return early with just 200 response message
                return { message: 'Successfully sent to third-party API' };
            }
            catch (error) {
                console.error('API Client Error:', error);
                throw new Error(`Failed to send to third-party API: ${error.message}`);
            }
        });
    }
}
exports.ApiClient = ApiClient;
//# sourceMappingURL=apiClient.js.map