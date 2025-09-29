import { Schema, model, Document, Types } from "mongoose";

export interface IPromocode extends Document {
  _id: Types.ObjectId;
  propertyId: Types.ObjectId;
  propertyCode: string;
  code: string;
  description?: string;
  discountType: "percentage" | "flat";
  discountValue: number;
  validFrom: Date;
  validTo: Date;
  minBookingAmount?: number;
  maxDiscountAmount?: number;
  useLimit: number;
  usageLimitPerUser?: number;
  applicableRoomType?: Types.ObjectId[];
  applicableRatePlans?: Types.ObjectId[];
  isActive: boolean;

  /**
   * Add usage tracking fields
   */
  currentUsage: number;
  usedBy: Types.ObjectId[];
  lastUsedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const PromocodeSchema = new Schema<IPromocode>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "PropertyInfo",
      required: [true, "Property ID is required"],
    },
    propertyCode: {
      type: String,
      required: [true, "Property code is required"],
    },
    code: {
      type: String,
      required: [true, "Promocode is Required"],
      unique: true,
    },
    description: {
      type: String
    },
    discountType: {
      type: String,
      enum: {
        values: ["percentage", "flat"],
        message: "Discount type must be either 'percentage' or 'flat'",
      },
      required: [true, "Discount type is required"],
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
    },
    validFrom: {
      type: Date,
      required: [true, "Valid from date is required"]
    },
    validTo: {
      type: Date,
      required: [true, "Valid to date is required"]
    },
    minBookingAmount: {
      type: Number,
      default: 0
    },
    maxDiscountAmount: {
      type: Number
    },
    useLimit: {
      type: Number,
      required: [true, "Total usage limit is required"]
    },
    usageLimitPerUser: {
      type: Number,
      default: 1
    },
    applicableRoomType: [
      {
        type: Schema.Types.ObjectId,
        ref: "Room"
      }
    ],
    applicableRatePlans: [
      {
        type: Schema.Types.ObjectId,
        ref: "RatePlan"
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    },

    /**
     * Adding usage tracking fields
     */
    currentUsage: {
      type: Number,
      default: 0,
      min: 0
    },
    usedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User"
      }
    ],
    lastUsedAt: {
      type: Date
    }

  },
  {
    timestamps: true,
  }
);

PromocodeSchema.index({ propertyId: 1, isActive: 1 });
PromocodeSchema.index({ propertyCode: 1, isActive: 1 });
PromocodeSchema.index({ validFrom: 1, validTo: 1 });
PromocodeSchema.index({ discountType: 1, discountValue: 1 });
PromocodeSchema.index({ code: 1, isActive: 1 });
PromocodeSchema.index({ propertyId: 1, code: 1 });
PromocodeSchema.index({ createdAt: -1 });
PromocodeSchema.index({
  isActive: 1,
  validFrom: 1,
  validTo: 1
});


PromocodeSchema.index({
  code: "text",
  description: "text",
  propertyCode: "text"
});

PromocodeSchema.index({ applicableRoomType: 1 }, { sparse: true });
PromocodeSchema.index({ applicableRatePlans: 1 }, { sparse: true });


export const Promocode = model<IPromocode>("Promocode", PromocodeSchema);
