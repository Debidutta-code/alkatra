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
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const googleAuthService_1 = require("../../services/googleAuthService");
const googleSocialAuth_controller_1 = require("../../controllers/googleSocialAuth.controller");
const index_1 = __importDefault(require("../../../../common/index"));
const router = (0, express_1.Router)();
const authService = new googleAuthService_1.AuthService();
const authController = new googleSocialAuth_controller_1.AuthController();
if (!index_1.default.googleClientId || !index_1.default.googleClientSecret || !index_1.default.googleFrontendCallbackUrl) {
    console.error('Missing Google OAuth environment variables:', {
        clientId: index_1.default.googleClientId,
        clientSecret: index_1.default.googleClientSecret ? '[REDACTED]' : undefined,
        callbackUrl: index_1.default.googleFrontendCallbackUrl,
    });
    throw new Error('Google OAuth configuration incomplete');
}
// Passport Google Strategy
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: index_1.default.googleClientId,
    clientSecret: index_1.default.googleClientSecret,
    callbackURL: `${process.env.GOOGLE_CALLBACK_URL}/google/auth/google/callback`,
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        console.log('Google profile received:', {
            id: profile.id,
            email: (_b = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.value,
            name: profile.displayName,
        });
        const result = yield authService.handleGoogleAuth(profile);
        done(null, result);
    }
    catch (err) {
        console.error('Google auth error:', err);
        done(err, false);
    }
})));
passport_1.default.serializeUser((user, done) => {
    console.log('Serializing user:', user.user._id);
    done(null, user.user._id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield authService.getUserById(id);
        done(null, user);
    }
    catch (err) {
        console.error('Deserialize error:', err);
        done(err, null);
    }
}));
router.post('/auth/google', authController.postGoogleAuthData.bind(authController));
// router.post('/mobile/google', authController.postMobileAuthData.bind(authController));
router.get('/auth/google', (req, res, next) => {
    console.log('🔔 /auth/google route called for:', req.originalUrl);
    next();
}, passport_1.default.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/auth/google/callback', (req, res, next) => {
    passport_1.default.authenticate('google', { session: false, failureRedirect: `${index_1.default.googleFrontendCallbackUrl}/login` }, (err, user) => {
        if (err) {
            console.error('Callback error:', err);
            return res.status(500).json({ error: 'Authentication failed' });
        }
        if (!user) {
            console.error('No user returned from Google auth');
            return res.redirect(`${index_1.default.googleFrontendCallbackUrl}/login`);
        }
        req.user = user;
        next();
    })(req, res, next);
}, (req, res) => {
    try {
        const { token } = req.user;
        console.log('Redirecting to dashboard with token:', token);
        res.redirect(`${index_1.default.googleFrontendCallbackUrl}/dashboard?token=${token}`);
    }
    catch (error) {
        console.error('Error in callback redirect:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/api/user', (req, res) => authController.getUser(req, res));
exports.default = router;
//# sourceMappingURL=googleAuthRoute.js.map