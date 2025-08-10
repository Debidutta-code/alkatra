import { Schema, Document, model, Types } from "mongoose";

interface IUserMessage extends Document {
    name: string,
    email: string,
    reason: string
}

const UserMessageSchema = new Schema<IUserMessage>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        reason: { type: String, required: true },
    },
    { timestamps: true }
)

const UserMessageModel = model<IUserMessage>("UserMessage", UserMessageSchema);

export { IUserMessage, UserMessageModel };