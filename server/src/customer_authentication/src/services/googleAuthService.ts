import { AuthRepository } from "../repositories/googleAuthRepository";
import jwt from 'jsonwebtoken';
import config from '../../../common/index';
import { google } from 'googleapis';
import { ICustomer } from '../models/customer.model';


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
      const { tokens } = await googleInitializeData.getToken(code);
      googleInitializeData.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: 'v2', auth: googleInitializeData });
      data = await oauth2.userinfo.get();

      // console.log(`^%$^%$&^%$^%$^%$^%^%$^%$&^%$\nThe data we get from Google WEB auth ${JSON.stringify(data)}`);

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


  async handleGoogleAuth(
    googleId: string,
    firstName: string,
    lastName: string,
    email: string,
    avatar: string
  ):
    Promise<{
      user: ICustomer;
      token: string;
    }> {

    let user = await this.repository.findUserByGoogleId(email);

    if (!user) {
      user = await this.repository.createUser({
        googleId: googleId,
        firstName: firstName,
        lastName: lastName,
        email: email,
        avatar: avatar,
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );
    return { user, token };
  }

  async getUserById(id: string): Promise<ICustomer> {
    return await this.repository.findUserById(id);
  }

}