import { Request, Response } from 'express';
import { AuthService } from '../services/googleAuthService';
import jwt from 'jsonwebtoken';
import config from '../../../common/index';



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
        return res.status(400).json({ error: "Google OAuth initialization failed" });
      }

      let userData;
      
      if (code) {
        userData = await this.service.handleGoogleAuthForWeb(code, googleInitialize);
        if (!userData?.data) {
          return res.status(400).json({ error: "Google web authentication failed" });
        }
      } else if (token) {
        userData = await this.service.handleGoogleAuthForMobile(token, googleInitialize);
        if (!userData?.data) {
          return res.status(400).json({ error: "Google mobile authentication failed" });
        }
      }

      // Extract user data
      const { id, given_name, family_name, email, picture } = userData.data;

      const result = await this.service.handleGoogleAuth(
        id, given_name, family_name, email, picture,
      );

      return res.status(200).json({ 
        token: result.token,
        user: {
          id: result.user._id,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          email: result.user.email,
          avatar: result.user.avatar
        }
      });

    } catch (error) {
      console.error('Error in Google auth:', error);
      return res.status(500).json({ error: 'Failed to authenticate with Google' });
    }
  }
}