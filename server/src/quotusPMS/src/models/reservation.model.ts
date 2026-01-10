import mongoose, { Document, Schema } from 'mongoose';
import { IQuotusPMSReservationRecord } from '../interfaces/reservation.interface';

export interface QuotusPMSReservationDocument extends Document, Omit<IQuotusPMSReservationRecord, 'createdAt' | 'updatedAt'> {}

const quotusPMSReservationSchema = new Schema<QuotusPMSReservationDocument>(
  {
    propertyId: {
      type: String,
      required: true,
      index: true,
    },
    reservationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    reservationData: {
      type: Schema.Types.Mixed,
      required: true,
    },
    requestPayload: {
      type: String,
      required: true,
    },
    responsePayload: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export const QuotusPMSReservation = mongoose.model<QuotusPMSReservationDocument>(
  'QuotusPMSReservation',
  quotusPMSReservationSchema
);
