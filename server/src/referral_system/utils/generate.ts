import { Types } from "mongoose";
import QRCode from "qrcode";

export const toObjectId = (id: string): Types.ObjectId => new Types.ObjectId(id);

export const generateQRCode = async (text: string): Promise<string> => {
    try {
        return await QRCode.toDataURL(text);
    } catch (error) {
        throw new Error("Failed to generate QR code");
    }
};