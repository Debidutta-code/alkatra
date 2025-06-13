import mongoose, { Schema } from "mongoose"

const testRatePlans = new Schema({
    rateType: {
        type: String,
        enum: ["NR", "AP", "MAP", "CP", "EP", "EBR", "APR", "RACK", "BAR"],
        required: true,
        default: "NR"
    },
    rateDescription: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
     weeklyDays: {
        type: [String],
        enum: [
            'monday', 'tuesday', 'wednesday',
            'thursday', 'friday', 'saturday', 'sunday'
        ],
        default: undefined,
    },
})
const NewRatePlanModel=mongoose.model("NewRatePlanModel",testRatePlans)
export default NewRatePlanModel