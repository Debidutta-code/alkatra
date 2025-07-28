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
exports.AuthController = void 0;
const googleAuthService_1 = require("../services/googleAuthService");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = __importDefault(require("../../../common/index"));
const googleapis_1 = require("googleapis");
class AuthController {
    constructor() {
        this.getUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            console.log('GOOGLE AUTH getUser called');
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
            if (!token) {
                return res.status(401).json({ message: 'No token provided' });
            }
            try {
                const decoded = jsonwebtoken_1.default.verify(token, index_1.default.jwtSecretKey || 'your-jwt-secret');
                const user = yield this.service.getUserById(decoded.id);
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                res.json(user);
            }
            catch (err) {
                res.status(401).json({ message: 'Invalid token' });
            }
        });
        this.postGoogleAuthData = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Entering into POST GOOGLE AUTH DATA");
                const { code, token } = req.body;
                if (!code && !token) {
                    return res.status(400).json({ error: 'Authorization code or token is required' });
                }
                const oauth2Client = new googleapis_1.google.auth.OAuth2(index_1.default.googleClientId, index_1.default.googleClientSecret, `${process.env.GOOGLE_FRONTEND_CALLBACK_URL}`);
                let data;
                if (code) {
                    // Web flow: Exchange authorization code for tokens
                    console.log('Received authorization code:', code);
                    const { tokens } = yield oauth2Client.getToken(code);
                    console.log(`Tokens from Google OAuth: ${JSON.stringify(tokens, null, 2)}`);
                    oauth2Client.setCredentials(tokens);
                    const oauth2 = googleapis_1.google.oauth2({ version: 'v2', auth: oauth2Client });
                    ({ data } = yield oauth2.userinfo.get());
                }
                else if (token) {
                    // Mobile flow: Handle access token
                    console.log('Received access token:', token);
                    oauth2Client.setCredentials({ access_token: token });
                    const oauth2 = googleapis_1.google.oauth2({ version: 'v2', auth: oauth2Client });
                    try {
                        ({ data } = yield oauth2.userinfo.get());
                    }
                    catch (error) {
                        console.error('Error fetching userinfo:', error);
                        return res.status(401).json({ error: 'Invalid or expired access token' });
                    }
                }
                if (!data || !data.id && !data.email) {
                    return res.status(400).json({ error: 'Invalid Google user data' });
                }
                console.log('Google user info:', data);
                const result = yield this.service.handleGoogleAuth({
                    id: data.id,
                    emails: data.email,
                    displayName: data.name || data.given_name || 'Unknown User',
                    avatar: data.picture,
                });
                console.log(`The token in GOOGLE auth is: ${result.token}`);
                return res.status(200).json({ token: result.token });
            }
            catch (error) {
                console.error('Error in /auth/google POST:', error);
                return res.status(500).json({ error: 'Failed to authenticate with Google' });
            }
        });
        this.service = new googleAuthService_1.AuthService();
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=googleSocialAuth.controller.js.map