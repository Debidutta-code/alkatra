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
exports.RoomAminity = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const roomAminitySchema = new mongoose_1.Schema({
    propertyInfo_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "PropertyInfo",
        required: true,
    },
    room_type: {
        type: String,
        ref: "Room",
        required: true,
    },
    amenities: {
        basic: {
            bed: {
                type: String,
                enum: ["single", "double", "king", "twin", "queen"],
                default: "single",
            },
            bathroom: { type: Boolean, default: false },
            linensBedding: { type: Boolean, default: false },
            linens: { type: Boolean, default: false },
            bidet: { type: Boolean, default: false },
            toiletPaper: { type: Boolean, default: false },
            towelsSheets: { type: Boolean, default: false }, // extra fee
            freeToiletries: { type: Boolean, default: false },
            shower: { type: Boolean, default: false },
            toilet: { type: Boolean, default: false },
        },
        furniture: {
            tableChairs: { type: Boolean, default: false },
            desk: { type: Boolean, default: false },
            dresserWardrobe: { type: Boolean, default: false },
            sofaSeating: { type: Boolean, default: false },
            diningTable: { type: Boolean, default: false },
            readingChair: { type: Boolean, default: false },
        },
        spaceLayout: {
            diningArea: { type: Boolean, default: false },
            sittingArea: { type: Boolean, default: false },
            balcony: { type: Boolean, default: false },
        },
        technology: {
            television: { type: Boolean, default: false },
            telephone: { type: Boolean, default: false },
            wifiInternet: { type: Boolean, default: false },
            flatScreenTV: { type: Boolean, default: false },
            satelliteChannels: { type: Boolean, default: false },
            cableChannels: { type: Boolean, default: false },
        },
        climateControl: {
            airConditioning: { type: Boolean, default: false },
            heating: { type: Boolean, default: false },
        },
        kitchenetteMiniBar: {
            smallRefrigerator: { type: Boolean, default: false },
            microwave: { type: Boolean, default: false },
            refrigerator: { type: Boolean, default: false },
            kitchenware: { type: Boolean, default: false },
            electricKettle: { type: Boolean, default: false },
            oven: { type: Boolean, default: false },
            stovetop: { type: Boolean, default: false },
            teaCoffeeMaker: { type: Boolean, default: false },
        },
        safetySecurity: {
            safe: { type: Boolean, default: false },
            smokeDetectors: { type: Boolean, default: false },
            fireExtinguisher: { type: Boolean, default: false },
        },
        toiletries: {
            shampooConditioner: { type: Boolean, default: false },
            soap: { type: Boolean, default: false },
            hairDryer: { type: Boolean, default: false },
        },
        workLeisure: {
            workDesk: { type: Boolean, default: false },
            additionalLighting: { type: Boolean, default: false },
            ironingFacilities: { type: Boolean, default: false },
        },
        accessibilityFeatures: {
            accessibleBathroom: { type: Boolean, default: false },
            wheelchairAccessibility: { type: Boolean, default: false },
            upperFloorsAccessibleByElevator: { type: Boolean, default: false },
            entireUnitWheelchairAccessible: { type: Boolean, default: false },
        },
    },
});
const RoomAminity = mongoose_1.default.model("RoomAminity", roomAminitySchema);
exports.RoomAminity = RoomAminity;
//# sourceMappingURL=room.amenite.model.js.map