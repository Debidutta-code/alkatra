"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OfferModel = void 0;
const mongoose_1 = require("mongoose");
const dataSchema = new mongoose_1.Schema({
    type: { type: String, required: true },
    offerCode: { type: String, required: true },
});
const offerSchema = new mongoose_1.Schema({
    hotelCode: { type: String, required: false },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: dataSchema, required: false },
    createdAt: { type: Date, default: Date.now },
});
exports.OfferModel = (0, mongoose_1.model)('Offer', offerSchema);
//# sourceMappingURL=hotelOffers.model.js.map