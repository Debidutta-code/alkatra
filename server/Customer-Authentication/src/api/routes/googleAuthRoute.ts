import { Express, Request, Response, Router } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { AuthService } from '../../services/googleAuthService';
import { AuthController } from '../../controllers/googleSocialAuth.controller';
import config from '../../../../Common_API/index';
import { google } from 'googleapis';

const router = Router();
const authService = new AuthService();
const authController = new AuthController();

if (!config.googleClientId || !config.googleClientSecret || !config.googleFrontendCallbackUrl) {
  console.error('Missing Google OAuth environment variables:', {
    clientId: config.googleClientId,
    clientSecret: config.googleClientSecret ? '[REDACTED]' : undefined,
    callbackUrl: config.googleFrontendCallbackUrl,
  });
  throw new Error('Google OAuth configuration incomplete');
}

// Passport Google Strategy
passport.use(new GoogleStrategy({
  clientID: config.googleClientId,
  clientSecret: config.googleClientSecret,
  callbackURL: `${process.env.GOOGLE_CALLBACK_URL}/google/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google profile received:', {
      id: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
    });
    const result = await authService.handleGoogleAuth(profile);
    done(null, result);
  } catch (err) {
    console.error('Google auth error:', err);
    done(err, false);
  }
}));

passport.serializeUser((user: any, done) => {
  console.log('Serializing user:', user.user._id);
  done(null, user.user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await authService.getUserById(id);
    done(null, user);
  } catch (err) {
    console.error('Deserialize error:', err);
    done(err, null);
  }
});


router.post('/auth/google', authController.postGoogleAuthData.bind(authController));
// router.post('/mobile/google', authController.postMobileAuthData.bind(authController));

router.get('/auth/google', (req, res, next) => {
  console.log('🔔 /auth/google route called for:', req.originalUrl);
  next();
}, passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false, failureRedirect: `${config.googleFrontendCallbackUrl}/login` }, (err, user) => {
    if (err) {
      console.error('Callback error:', err);
      return res.status(500).json({ error: 'Authentication failed' });
    }
    if (!user) {
      console.error('No user returned from Google auth');
      return res.redirect(`${config.googleFrontendCallbackUrl}/login`);
    }
    req.user = user;
    next();
  })(req, res, next);
}, (req: any, res: Response) => {
  try {
    const { token } = req.user;
    console.log('Redirecting to dashboard with token:', token);
    res.redirect(`${config.googleFrontendCallbackUrl}/dashboard?token=${token}`);
  } catch (error) {
    console.error('Error in callback redirect:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/api/user', (req: Request, res: Response) => authController.getUser(req, res));

export default router;