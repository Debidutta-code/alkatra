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
exports.PropertyInfo = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const propertyInfoSchema = new mongoose_1.Schema({
    user_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    property_name: { type: String, required: true },
    property_email: { type: String, required: true, unique: true },
    property_contact: { type: String, required: true },
    star_rating: { type: String, required: true },
    property_code: { type: String, required: true, unique: true },
    property_address: { type: mongoose_1.Schema.Types.ObjectId, ref: "PropertyAddress" },
    property_amenities: { type: mongoose_1.Schema.Types.ObjectId, ref: "propertyAminity" },
    property_category: { type: mongoose_1.Schema.Types.ObjectId, ref: "PropertyCategory" },
    property_type: { type: mongoose_1.Schema.Types.ObjectId, ref: "PropertyType", required: [true, "Property type is required"], },
    property_room: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Room" }],
    room_Aminity: { type: mongoose_1.Schema.Types.ObjectId, ref: "RoomAminity" },
    image: [{ type: String }],
    description: { type: String },
    isDraft: { type: Boolean, default: true, },
    rate_plan: [{ type: mongoose_1.Schema.Types.ObjectId }],
});
const PropertyInfo = mongoose_1.default.model("PropertyInfo", propertyInfoSchema);
exports.PropertyInfo = PropertyInfo;
//# sourceMappingURL=property.info.model.js.map