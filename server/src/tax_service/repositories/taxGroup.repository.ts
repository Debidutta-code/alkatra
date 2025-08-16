import { ITaxGroup, TaxGroupModel } from "../models";
import { ITaxGroupRepository } from "../interfaces";


export class TaxGroupRepository implements ITaxGroupRepository {
    private static instance: TaxGroupRepository

    private constructor() { }

    static getInstance(): TaxGroupRepository {
        if (!TaxGroupRepository.instance) {
            TaxGroupRepository.instance = new TaxGroupRepository()
        }
        return TaxGroupRepository.instance
    }


    async create(data: Partial<ITaxGroup>): Promise<ITaxGroup> {
        try {
            return await TaxGroupModel.create(data);
        } catch (error: any) {
            console.error("Failed to create tax group at Repository Layer:", error);
            throw error;
        }
    }


    async findAll(hotelId: string): Promise<ITaxGroup[]> {
        try {
            return await TaxGroupModel.find({ hotelId: hotelId }).exec();
        } catch (error: any) {
            console.error("Failed to find all tax groups at Repository Layer:", error);
            throw error;
        }
    }


    async update(id: string, data: Partial<ITaxGroup>): Promise<ITaxGroup | null> {
        try {
            return await TaxGroupModel.findByIdAndUpdate(id, data, { new: true }).exec();
        } catch (error: any) {
            console.error("Failed to update tax group at Repository Layer:", error);
            throw error;
        }
    }


    async delete(id: string): Promise<boolean> {
        try {
            const result = await TaxGroupModel.findByIdAndDelete(id).exec();
            return result !== null;
        } catch (error: any) {
            console.error("Failed to delete tax group at Repository Layer:", error);
            throw error;
        }
    }


    async findById(id: string): Promise<ITaxGroup | null> {
        try {
            return await TaxGroupModel.findById(id).exec();
        } catch (error: any) {
            console.error("Failed to find tax group by ID at Repository Layer:", error);
            throw error;
        }
    }

}