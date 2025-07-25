import { Request, Response } from 'express';
import { AuthService } from '../services/googleAuthService';
import jwt from 'jsonwebtoken';
import config from '../../../common/index';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';


export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  getUser = async (req: Request, res: Response) => {
    console.log('GOOGLE AUTH getUser called');
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    try {
      const decoded = jwt.verify(token, config.jwtSecretKey || 'your-jwt-secret') as { id: string };
      const user = await this.service.getUserById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (err) {
      res.status(401).json({ message: 'Invalid token' });
    }
  }

  postGoogleAuthData = async (req: Request, res: Response) => {
    try {
      console.log("Entering into POST GOOGLE AUTH DATA");
      const { code, token } = req.body;
      if (!code && !token) {
        return res.status(400).json({ error: 'Authorization code or token is required' });
      }

      const oauth2Client = new google.auth.OAuth2(
        config.googleClientId,
        config.googleClientSecret,
        `${process.env.GOOGLE_FRONTEND_CALLBACK_URL}`
      );

      let data;
      if (code) {
        // Web flow: Exchange authorization code for tokens
        console.log('Received authorization code:', code);
        const { tokens } = await oauth2Client.getToken(code);
        console.log(`Tokens from Google OAuth: ${JSON.stringify(tokens, null, 2)}`);
        oauth2Client.setCredentials(tokens);
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        ({ data } = await oauth2.userinfo.get());
      } else if (token) {
        // Mobile flow: Handle access token
        console.log('Received access token:', token);
        oauth2Client.setCredentials({ access_token: token });
        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        try {
          ({ data } = await oauth2.userinfo.get());
        } catch (error) {
          console.error('Error fetching userinfo:', error);
          return res.status(401).json({ error: 'Invalid or expired access token' });
        }
      }

      if (!data || !data.id && !data.email) {
        return res.status(400).json({ error: 'Invalid Google user data' });
      }

      console.log('Google user info:', data);

      const result = await this.service.handleGoogleAuth({
        id: data.id,
        emails: data.email,
        displayName: data.name || data.given_name || 'Unknown User',
        avatar: data.picture,
      });
      console.log(`The token in GOOGLE auth is: ${result.token}`);
      return res.status(200).json({ token: result.token });
    } catch (error) {
      console.error('Error in /auth/google POST:', error);
      return res.status(500).json({ error: 'Failed to authenticate with Google' });
    }
  }
}