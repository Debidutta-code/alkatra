import { GoogleUser, IUser } from "../models/googleUser.model";


export class AuthRepository {
  async findUserByGoogleId(googleId: string): Promise<IUser | null> {
    return await GoogleUser.findOne({ googleId });
  }

  async createUser(data: Partial<IUser>): Promise<IUser> {
    const user = new GoogleUser(data);
    return await user.save();
  }

  async findUserById(id: string): Promise<IUser | null> {
    return await GoogleUser.findById(id);
  }
}