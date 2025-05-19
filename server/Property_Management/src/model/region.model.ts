import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRegion extends Document {
    _id: Types.ObjectId;
    region_name: string;
    region_code: string;
    countries: {
        _id: Types.ObjectId;
        country_name: string;
        country_code: string;
        states: {
            _id: Types.ObjectId;
            state_name: string;
            state_code: string;
            state_cities_list: {
                _id: Types.ObjectId;
                city_name: string;
            }[];
        }[];
    }[];
}

const RegionSchema = new Schema<IRegion>({
    _id: { type: Schema.Types.ObjectId, auto: true },
    region_name: { type: String, required: true, unique: true },
    region_code: { type: String, required: true, unique: true },
    countries: [
        {
            _id: { type: Schema.Types.ObjectId, auto: true },
            country_name: { type: String, required: true },
            country_code: { type: String, required: true },
            states: [
                {
                    _id: { type: Schema.Types.ObjectId, auto: true },
                    state_name: { type: String, required: true },
                    state_code: { type: String, required: true },
                    state_cities_list: [
                        {
                            _id: { type: Schema.Types.ObjectId, auto: true },
                            city_name: { type: String, required: true }
                        }
                    ]
                }
            ]
        }
    ]
});

export const Region = mongoose.model<IRegion>("Region", RegionSchema);
