import { Express, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { AuthService } from '../../services/googleAuthService';
import { AuthController } from '../../controllers/googleSocialAuth.controller';
import config from '../../../../Common_API/index';

export const initializeAuthRoutes = (app: Express) => {
  const authService = new AuthService();
  const authController = new AuthController();

  // Passport Google Strategy
  passport.use(new GoogleStrategy({
    clientID: config.googleClientId || '',
    clientSecret: config.googleClientSecret || '',
    callbackURL: '/api/v1',
  }, async (accessToken: string, refreshToken: string, profile: any, done) => {
    try {
      const result = await authService.handleGoogleAuth(profile);
      done(null, result);
    } catch (err) {
      done(err, false);
    }
  }));

  // Minimal serialization (required by Passport, even without sessions)
  passport.serializeUser((user: any, done) => {
    done(null, user.user._id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await authService.getUserById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // Routes
  app.get('/auth/google', (req, res, next) => {
    console.log("🔔 /auth/google route called");
    next();
  }, passport.authenticate('google', { scope: ['profile', 'email'], session: false }));


  app.get('/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${config.googleFrontendCallbackUrl}/login` }),
    (req: any, res: Response) => {
      const { token } = req.user;
      res.redirect(`${config.googleFrontendCallbackUrl}/dashboard?token=${token}`);
    }
  );

  app.get('/api/user', (req: Request, res: Response) => authController.getUser(req, res));
};