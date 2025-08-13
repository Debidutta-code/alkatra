import { Types } from "mongoose";

export class Validator {

    private static validateMongoId = (mongoId: string): boolean | string => {
        if (!mongoId || !Types.ObjectId.isValid(mongoId)) throw new Error("Invalid ID");
        return true;
    }

    public static validateID(id: string) {
        return this.validateMongoId(id);
    }

    public static validateAmount(amount: number): boolean {
        if (isNaN(amount) || amount <= 0) throw new Error("Invalid amount");
        return true;
    }

}