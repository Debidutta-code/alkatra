"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateAmount = void 0;
const mongoose_1 = require("mongoose");
const rateAmountSchema = new mongoose_1.Schema({
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
rateAmountSchema.index({ hotelCode: 1, invTypeCode: 1, startDate: 1, endDate: 1 });
exports.RateAmount = (0, mongoose_1.model)('RateAmount', rateAmountSchema);
//# sourceMappingURL=ratePlanModel.js.map