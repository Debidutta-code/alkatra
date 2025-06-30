import { Request, Response } from 'express';
import { AuthService } from '../services/googleAuthService';
import jwt from 'jsonwebtoken';
import config from '../../../Common_API/index';
import { google } from 'googleapis';

export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  async getUser(req: Request, res: Response) {
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

  async postGoogleAuthData(req: Request, res: Response) {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ error: 'Authorization code is required' });
      }

      console.log('Received authorization code:', code);

      const oauth2Client = new google.auth.OAuth2(
        config.googleClientId,
        config.googleClientSecret,
        'http://localhost:3004/auth/google/callback'
      );

      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const { data } = await oauth2.userinfo.get();

      if (!data.id || !data.email) {
        return res.status(400).json({ error: 'Invalid Google user data' });
      }

      console.log('Google user info:', data);

      const result = await this.service.handleGoogleAuth({
        id: data.id,
        emails: [{ value: data.email }],
        displayName: data.name || 'Unknown User',
      });

      return res.status(200).json({ token: result.token, user: result.user });
    } catch (error) {
      console.error('Error in /auth/google POST:', error);
      return res.status(500).json({ error: 'Failed to authenticate with Google', details: error });
    }
  }
}