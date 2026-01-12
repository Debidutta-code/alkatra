import mongoose, { Schema, model, Document } from 'mongoose';

export interface IRateAmountDateWise extends Document {
    hotelCode: string;
    hotelName: string;
    invTypeCode: string;
    ratePlanCode: string;
    startDate: Date;
    endDate: Date;
    days: {
        mon: boolean;
        tue: boolean;
        wed: boolean;
        thu: boolean;
        fri: boolean;
        sat: boolean;
        sun: boolean;
    };
    currencyCode: string;
    baseByGuestAmts: Array<{
        amountBeforeTax: number;
        numberOfGuests: number;
    }>;
    additionalGuestAmounts: Array<{
        ageQualifyingCode: string;
        amount: number;
    }>;
    dataSource?: string; // Track which PMS this data came from (Internal, Wincloud, QuotusPMS)
    restrictions?: any; // Store rate plan restrictions
    createdAt: Date;
}

const rateAmountSchema = new Schema<IRateAmountDateWise>({
    hotelCode: { type: String, required: true },
    hotelName: { type: String, required: true },
    invTypeCode: { type: String, required: true },
    ratePlanCode: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: {
        mon: { type: Boolean, required: false },
        tue: { type: Boolean, required: false },
        wed: { type: Boolean, required: false },
        thu: { type: Boolean, required: false },
        fri: { type: Boolean, required: false },
        sat: { type: Boolean, required: false },
        sun: { type: Boolean, required: false },
    },
    currencyCode: { type: String, required: true },
    baseByGuestAmts: [{
        amountBeforeTax: { type: Number, required: true },
        numberOfGuests: { type: Number, required: true },
    }],
    additionalGuestAmounts: [{
        ageQualifyingCode: { type: String, required: true, enum: ['10', '8', '7'] },
        amount: { type: Number, required: true },
    }],
    dataSource: { type: String, required: false }, // Track data source: Internal, Wincloud, QuotusPMS
    restrictions: { type: Schema.Types.Mixed, required: false }, // Store rate plan restrictions
    createdAt: { type: Date, default: Date.now },
});

rateAmountSchema.index({ hotelCode: 1, invTypeCode: 1, startDate: 1, endDate: 1 });

const RateAmount = model<IRateAmountDateWise>('RateAmountDateWise', rateAmountSchema);
export default RateAmount;