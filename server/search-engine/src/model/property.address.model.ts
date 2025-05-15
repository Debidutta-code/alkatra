import mongoose, { Document, Schema, Types } from 'mongoose';
import {PropertyInfoType, PropertyInfo} from './property.info.model'

interface PropertyAddressType extends Document {
    propertyInfo: Types.ObjectId | PropertyInfoType;
    address_line_1:string;
    address_line_2:string;
    country:string;
    state: string;
    city: string;
    location: string;
    neighbour_area:string;
    zip_code:number

}


const propertyAddressSchema = new Schema<PropertyAddressType>({
    propertyInfo: { type: Schema.Types.ObjectId, ref: 'PropertyInfo',required: true },
    address_line_1: { type: String, required: true },
    address_line_2: { type: String },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    location: { type: String, required: true },
    neighbour_area: { type: String, required: true },
    zip_code: { type: Number, required: true },


});


const PropertyAddress = mongoose.model<PropertyAddressType>('PropertyAddress', propertyAddressSchema);

export { PropertyAddress, PropertyAddressType };
