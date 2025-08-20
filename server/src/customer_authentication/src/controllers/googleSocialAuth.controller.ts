import { Request, Response } from 'express';
import { AuthService } from '../services/googleAuthService';
import jwt from 'jsonwebtoken';
import config from '../../../common/index';
import { google } from 'googleapis';


export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  getUser = async (req: Request, res: Response) => {

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecretKey) as { id: string };

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

      const { code, token } = req.body;
      if (!code && !token) {
        return res.status(400).json({ error: 'Authorization code or token is required' });
      }

      const googleInitialize = await this.service.initializeGoogleOAuth();
      if (!googleInitialize) {
        return res.status(400).json({ error: "Google initialize not " });
      }

      if (code) {

        const webLoginData = await this.service.handleGoogleAuthForWeb(code, googleInitialize);
        if (!webLoginData) {
          return res.status(400).json({ error: "Google login at web unsuccessful" });
        }

        const result = await this.service.handleGoogleAuth({
          id: webLoginData.id,
          emails: webLoginData.email,
          displayName: webLoginData.name || webLoginData.given_name || 'Unknown User',
          avatar: webLoginData.picture,
        });

        console.log(`The google web result we get ${JSON.stringify(result)}`);

        return res.status(200).json({ token: result.token });
      }

      else if (token) {

        const mobileLoginData = await this.service.handleGoogleAuthForMobile(token, googleInitialize);
        if (!mobileLoginData) {
          return res.status(400).json({ error: "Google login at mobile unsuccessful" });
        }

        const result = await this.service.handleGoogleAuth({
          id: mobileLoginData.id,
          emails: mobileLoginData.email,
          displayName: mobileLoginData.name || mobileLoginData.given_name || 'Unknown User',
          avatar: mobileLoginData.picture,
        });

        return res.status(200).json({ token: result.token });
      }
    }

    catch (error) {
      console.error('Error in /auth/google POST:', error);
      return res.status(500).json({ error: 'Failed to authenticate with Google' });
    }
  }
}