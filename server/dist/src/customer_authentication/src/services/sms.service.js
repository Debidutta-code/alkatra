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
exports.TwilioService = void 0;
// twilioService.ts
const twilio_1 = __importDefault(require("twilio"));
class TwilioService {
    constructor() {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        this.from = process.env.TWILIO_PHONE_NUMBER;
        this.client = (0, twilio_1.default)(accountSid, authToken);
    }
    sendSMS(to, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const mode = process.env.MODE;
            if (!mode) {
                console.error("❌ MODE is not defined in .env");
                return;
            }
            if (mode === 'development') {
                console.log(`🛑 Skipped sending SMS in development mode: To=${to}, Message="${message}"`);
                return;
            }
            else if (mode === 'production') {
                try {
                    const result = yield this.client.messages.create({
                        body: message,
                        from: this.from,
                        to,
                    });
                    console.log('✅ SMS sent:', result.sid);
                }
                catch (error) {
                    console.error('❌ Failed to send SMS:', error);
                    throw error;
                }
            }
        });
    }
}
exports.TwilioService = TwilioService;
//# sourceMappingURL=sms.service.js.map