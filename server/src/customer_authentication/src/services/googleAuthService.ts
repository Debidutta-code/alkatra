import { IUser } from "../models/googleUser.model";
import { AuthRepository } from "../repositories/googleAuthRepository";
import jwt from 'jsonwebtoken';
import config from '../../../common/index';
import { google } from 'googleapis';

export class AuthService {
  private repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
  }

  async initializeGoogleOAuth() {

    const oauth2Client = new google.auth.OAuth2(
      config.googleClientId,
      config.googleClientSecret,
      `${process.env.GOOGLE_FRONTEND_CALLBACK_URL}`
    );

    if (!oauth2Client) {
      throw new Error("Google initialization not happen");
    }
    return oauth2Client;

  }

  async handleGoogleAuthForWeb(code: string, googleInitializeData: any) {

    if (!code || !googleInitializeData) {
      throw new Error("Code or Google Initialize data not found for Google login for web");
    }

    try {
      let data: any;
      const { tokens } = await googleInitializeData.getToken(code)
      googleInitializeData.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: 'v2', auth: googleInitializeData });
      data = await oauth2.userinfo.get();
      return data;
    } catch (error) {
      console.error('Google token exchange or user info fetch failed:');
      throw new Error(`Google token exchange or user info fetch failed for web ${error}`);
    }

  }

  async handleGoogleAuthForMobile(token: string, googleInitializeData: any) {

    if (!token || !googleInitializeData) {
      throw new Error("Token or Google Initialize data not found for Google login for mobile");
    }


    try {
      let data: any;

      googleInitializeData.setCredentials({ access_token: token });

      const oauth2 = google.oauth2({ version: 'v2', auth: googleInitializeData });

      ({ data } = await oauth2.userinfo.get());

      return data;
    } catch (error) {
      console.error('Error fetching userinfo:', error);
      throw new Error(`Google token exchange or user info fetch failed for mobile ${error}`);
    }

  }


  async handleGoogleAuth(profile: any): Promise<{ user: IUser; token: string }> {
    let user = await this.repository.findUserByGoogleId(profile.id);
    if (!user) {
      user = await this.repository.createUser({
        googleId: profile.id,
        displayName: profile.displayName,
        email: profile.emails,
        avatar: profile.avatar,
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