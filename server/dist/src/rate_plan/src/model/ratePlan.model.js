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
const mongoose_1 = __importStar(require("mongoose"));
const schedulingSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['weekly', 'date_range', 'specific-dates'],
        required: true,
    },
    weeklyDays: {
        type: [String],
        enum: [
            'monday', 'tuesday', 'wednesday',
            'thursday', 'friday', 'saturday', 'sunday'
        ],
        default: undefined,
    },
    // periodic days
    dateRanges: [
        {
            start: { type: Date },
            end: { type: Date },
        }
    ],
    availableSpecificDates: [Date],
}, { _id: false });
const ratePlanSchema = new mongoose_1.Schema({
    propertyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'PropertyInfo',
        required: true
    },
    ratePlanCode: {
        type: String,
        required: true,
        unique: true
    },
    ratePlanName: { type: String, required: true },
    minLengthStay: { type: Number, required: true },
    maxLengthStay: { type: Number, required: true },
    minReleaseDay: { type: Number, required: true },
    maxReleaseDay: { type: Number, required: true },
    cancellationDeadline: {
        days: { type: Number, default: 0 },
        hours: { type: Number, default: 0 }
    },
    description: { type: String },
    mealPlan: {
        type: String,
        enum: ['RO', 'BB', 'HB', 'FB'],
        required: false,
        default: 'RO',
    },
    currency: {
        type: String,
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive'
    },
    createdBy: { type: Date, default: Date.now },
    updatedBy: { type: Date, default: Date.now },
    scheduling: {
        type: schedulingSchema,
        required: true
    }
}, {
    timestamps: true
});
const RatePlanModel = mongoose_1.default.model('RatePlanModel', ratePlanSchema);
exports.default = RatePlanModel;
//# sourceMappingURL=ratePlan.model.js.map