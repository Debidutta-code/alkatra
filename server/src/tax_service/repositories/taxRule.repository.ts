import { ITaxRule, TaxRuleModel } from "../models";
import { ITaxRuleRepository } from "../interfaces";
import { Types } from "mongoose";


export class TaxRuleRepository implements ITaxRuleRepository {
    private static instance: TaxRuleRepository;

    private constructor() { }

    static getInstance(): TaxRuleRepository {
        if (!TaxRuleRepository.instance) {
            TaxRuleRepository.instance = new TaxRuleRepository();
        }
        return TaxRuleRepository.instance;
    }


    async create(data: Partial<ITaxRule>): Promise<ITaxRule> {
        try {
            return await TaxRuleModel.create(data);
        } catch (error: any) {
            console.error("Failed to create tax rule at Repository Layer:", error);
            throw error;
        }
    }

    async findAll(id: string): Promise<ITaxRule[]> {
        try {
            return await TaxRuleModel.find({ hotelId: id }).exec();
        } catch (error: any) {
            console.error("Failed to find all tax rules at Repository Layer:", error);
            throw error;
        }
    }

    async update(id: string, data: Partial<ITaxRule>): Promise<ITaxRule | null> {
        try {
            /**
             * This is a separate object to hold the update operations
             */
            const updateOps: { $set?: Partial<ITaxRule>; $unset?: { description?: 1 } } = {
                $set: {},
            };

            /**
             * Copy all fields except description to $set, skipping undefined values
             * Use 'as any' to bypass strict typing
             */
            for (const [key, value] of Object.entries(data)) {
                if (key !== 'description' && value !== undefined) {
                    (updateOps.$set as any)[key] = value;
                }
            }

            /**
             * Handle description separately
             */
            if ('description' in data) {
                updateOps.$set!.description = data.description ?? '';
            } else {
                updateOps.$unset = { description: 1 };
            }

            // return await TaxRuleModel.findByIdAndUpdate(id, data, { new: true }).exec();
            return await TaxRuleModel.findByIdAndUpdate(id, updateOps, { new: true }).exec();
        } catch (error: any) {
            console.error("Failed to update tax rule at Repository Layer:", error);
            throw error;
        }
    }

    async delete(id: string): Promise<boolean> {
        try {
            const result = await TaxRuleModel.findByIdAndDelete(id).exec();
            return result !== null;
        } catch (error: any) {
            console.error("Failed to delete tax rule at Repository Layer:", error);
            throw error;
        }
    }

    async findById(id: string): Promise<ITaxRule | null> {
        try {
            return await TaxRuleModel.findById(id).exec();
        } catch (error: any) {
            console.error("Failed to find tax rule by ID at Repository Layer:", error);
            throw error;
        }
    }

    async findByTaxCode(taxCode: string): Promise<ITaxRule | null> {
        try {
            return await TaxRuleModel.findOne({ taxCode }).exec();
        } catch (error: any) {
            console.error("Failed to find tax rule by tax code at Repository Layer:", error);
            throw error;
        }
    }

    async findByHotelId(hotelId: string): Promise<ITaxRule[] | null> {
        try {
            return await TaxRuleModel.find({ hotelId }).exec();
        } catch (error: any) {
            console.error("Failed to find tax rules by hotel ID at Repository Layer:", error);
            throw error;
        }
    }


    /**
     * This method finds tax rules by hotel id and an array of tax rule ids.
     * And this will be used to check if the tax rules belong to this hotel, for creating tax groups
     * @param hotelId - hotel id
     * @param ruleIds - array of tax rule ids
     * @returns array of tax rules or null
     */
    async findByHotelAndIds(hotelId: Types.ObjectId, ruleIds: Types.ObjectId[]): Promise<ITaxRule[]> {
        return TaxRuleModel.find({
            _id: { $in: ruleIds },
            hotelId: hotelId
        });
    }


    /**
     * Find all tax rules by their IDs and return only
     * type, value, and applicableOn fields.
     * 
     * @param ruleIds Array of TaxRule ObjectIds
     * @returns Array of TaxRule objects with limited fields
     */
    async findTaxRulesByIds(ruleIds: Types.ObjectId[] | string[]) {
        try {
            const taxRules = await TaxRuleModel.find(
                { _id: { $in: ruleIds } },
                {
                    type: 1,
                    value: 1,
                    applicableOn: 1,
                    name: 1,
                    _id: 0
                }
            ).lean();

            return taxRules;
        } catch (error) {
            console.error("Error fetching tax rules:", error);
            throw error;
        }
    }

}