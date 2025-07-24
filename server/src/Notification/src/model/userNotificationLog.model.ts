import mongoose, { Schema, Document } from 'mongoose';

export interface IUserNotificationLog extends Document {
  userId: string;
  offerId: mongoose.Types.ObjectId;
  hotelCode: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  sentAt: Date;
  markedAs: boolean;
}

const UserNotificationLogSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  offerId: { type: Schema.Types.ObjectId, ref: 'OfferModel' },
  hotelCode: { type: String, required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  data: { type: Map, of: String },
  sentAt: { type: Date, default: Date.now },
  markedAs: { type: Boolean, default: false },
});

export default mongoose.model<IUserNotificationLog>('NotificationLog', UserNotificationLogSchema);