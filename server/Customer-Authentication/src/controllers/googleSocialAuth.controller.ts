import { Request, Response } from 'express';
import { AuthService } from '../services/googleAuthService';
import jwt from 'jsonwebtoken';
import config from '../../../Common_API/index';

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
}