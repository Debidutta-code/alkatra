import { IUser } from "../models/googleUser.model";
import { AuthRepository } from "../repositories/googleAuthRepository";
import jwt from 'jsonwebtoken';
import config from '../../../Common_API/index';

export class AuthService {
  private repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
  }

  async handleGoogleAuth(profile: any): Promise<{ user: IUser; token: string }> {
    let user = await this.repository.findUserByGoogleId(profile.id);
    if (!user) {
      user = await this.repository.createUser({
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos[0].value,
      });
    }
    const token = jwt.sign(
                { id: user._id },
                process.env.JWT_SECRET_KEY || "your-secret-key",
                { expiresIn: "7d" }
            );
    return { user, token };
  }

  async getUserById(id: string): Promise<IUser | null> {
    return await this.repository.findUserById(id);
  }
}