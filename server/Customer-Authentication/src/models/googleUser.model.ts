import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  googleId: string;
  displayName: string;
  email: string;
  avatar?: string;
}

const googleUserSchema: Schema = new Schema({
  googleId: { type: String, required: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String },
});

export const GoogleUser = mongoose.model<IUser>('GoogleUser', googleUserSchema);