"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyAddress = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const propertyAddressSchema = new mongoose_1.Schema({
    property_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "PropertyInfo",
        required: true,
    },
    address_line_1: { type: String, required: true },
    address_line_2: { type: String, required: false },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    location: { type: String, required: false },
    landmark: { type: String, required: true },
    zip_code: { type: Number, required: true },
});
// propertyAddressSchema.pre("save", async function (next) {
//   const address = this as PropertyAddressType;
//   // Create a new Location document
//   const newLocation = new Location({
//     propertyId: address.property_id,
//     houseNo: address.address_line_1,
//     // area: address.address_line_2,
//     pincode: address.zip_code,
//     country: address.country,
//     state: address.state,
//     city: address.city,
//     coordinates: { type: "Point", coordinates: ["85.7374098", "20.2910851"] },
//   });
//   // Save the Location document
//   const savedLocation = await newLocation.save();
//   // Set the location field of the PropertyAddress to the ObjectId of the saved Location
//   // address.location = savedLocation._id;
//   next();
// });
const PropertyAddress = mongoose_1.default.model("PropertyAddress", propertyAddressSchema);
exports.PropertyAddress = PropertyAddress;
//# sourceMappingURL=property.address.model.js.map