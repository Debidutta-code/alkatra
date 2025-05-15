import { Schema, model, Document } from 'mongoose';

interface IRateAmount extends Document {
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
    createdAt: Date;
}

const rateAmountSchema = new Schema<IRateAmount>({
    hotelCode: { type: String, required: true },
    hotelName: { type: String, required: true },
    invTypeCode: { type: String, required: true },
    ratePlanCode: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    days: {
        mon: { type: Boolean, required: true },
        tue: { type: Boolean, required: true },
        wed: { type: Boolean, required: true },
        thu: { type: Boolean, required: true },
        fri: { type: Boolean, required: true },
        sat: { type: Boolean, required: true },
        sun: { type: Boolean, required: true },
    },
    currencyCode: { type: String, required: true },
    baseByGuestAmts: [{
        amountBeforeTax: { type: Number, required: true },
        numberOfGuests: { type: Number, required: true, enum: [1, 2, 3, 4] },
    }],
    additionalGuestAmounts: [{
        ageQualifyingCode: { type: String, required: true, enum: ['10', '8', '7'] },
        amount: { type: Number, required: true },
    }],
    createdAt: { type: Date, default: Date.now },
});

export const RateAmount = model<IRateAmount>('RateAmount', rateAmountSchema);