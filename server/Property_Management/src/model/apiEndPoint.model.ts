import mongoose, { Document, Model, Schema, Types } from "mongoose";

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

export type ApiEndpointType = {
    name: string; 
    method: HttpMethod;
    route: string; 
    description?: string;
};

type ApiEndpointModelType = Model<ApiEndpointType>;

const apiEndpointSchema = new Schema<ApiEndpointType>(
    {
        name: { type: String, required: true, unique: true },
        method: { type: String, required: true, enum: Object.values(HttpMethod) },
        route: { type: String, required: true, unique: true },
        description: { type: String },
    },
    { timestamps: true }
);

const ApiEndpoint = mongoose.model<ApiEndpointType, ApiEndpointModelType>(
    "ApiEndpoint",
    apiEndpointSchema
);
  
export default ApiEndpoint;

