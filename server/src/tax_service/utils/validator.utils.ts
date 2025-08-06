import { Types } from "mongoose";

export class Validator {

    private static validateMongoId = (mongoId: string): boolean | string => {
        if (!mongoId || !Types.ObjectId.isValid(mongoId)) throw new Error("Invalid ID");
        return true;
    }

    public static validateID(id: string) {
        return this.validateMongoId(id);
    }

}