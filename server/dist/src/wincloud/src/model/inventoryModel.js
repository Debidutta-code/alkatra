"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inventory = void 0;
const mongoose_1 = require("mongoose");
// const getISTTime = () => {
//   const utc = new Date();
//   const istOffset = 5.5 * 60 * 60 * 1000; 
//   return new Date(utc.getTime() + istOffset);
// };
const availabilitySchema = new mongoose_1.Schema({
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    count: { type: Number, required: true },
}, { _id: false });
const inventorySchema = new mongoose_1.Schema({
    hotelCode: { type: String, required: true },
    hotelName: { type: String, required: true },
    invTypeCode: { type: String, required: true },
    availability: { type: availabilitySchema, required: true },
    // createdAtIST: { type: Date, default: getISTTime },
    // updatedAtIST: { type: Date, default: getISTTime },
}, { timestamps: true });
exports.Inventory = (0, mongoose_1.model)('RoomInventory', inventorySchema);
//# sourceMappingURL=inventoryModel.js.map