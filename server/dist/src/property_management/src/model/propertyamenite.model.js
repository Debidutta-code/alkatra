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
exports.propertyAminity = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const propertyAmenitiesSchema = new mongoose_1.Schema({
    propertyInfo_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'PropertyInfo', required: true },
    destination_type: { type: String, required: false },
    property_type: { type: String, required: true },
    no_of_rooms_available: { type: Number, required: true },
    amenities: {
        wifi: { type: Boolean, default: false },
        swimming_pool: { type: Boolean, default: false },
        fitness_center: { type: Boolean, default: false },
        spa_and_wellness: { type: Boolean, default: false },
        restaurant: { type: Boolean, default: false },
        room_service: { type: Boolean, default: false },
        bar_and_lounge: { type: Boolean, default: false },
        parking: { type: Boolean, default: false },
        concierge_services: { type: Boolean, default: false },
        pet_friendly: { type: Boolean, default: false },
        business_facilities: { type: Boolean, default: false },
        laundry_services: { type: Boolean, default: false },
        child_friendly_facilities: { type: Boolean, default: false },
        non_smoking_rooms: { type: Boolean, default: false },
        facilities_for_disabled_guests: { type: Boolean, default: false },
        family_rooms: { type: Boolean, default: false },
    },
});
const propertyAminity = mongoose_1.default.model("propertyAminity", propertyAmenitiesSchema);
exports.propertyAminity = propertyAminity;
//# sourceMappingURL=propertyamenite.model.js.map