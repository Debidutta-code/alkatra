import { ITaxGroupService } from "../interfaces";
import { ITaxGroup } from "../models";
import { TaxGroupRepository, TaxRuleRepository } from "../repositories";
import { Generator } from "../utils";
import { config } from "../../config";
import { CommonService } from "../../services";

const { taxGroupPrefix } = config.taxSystem;


export class TaxGroupService implements ITaxGroupService {
    private static instance: TaxGroupService;
    private taxGroupRepository: TaxGroupRepository;
    private taxRuleRepository: TaxRuleRepository;
    private commonService: CommonService;

    private constructor(
        taxGroupRepository: TaxGroupRepository,
        taxRuleRepository: TaxRuleRepository,
        commonService: CommonService
    ) {
        this.taxGroupRepository = taxGroupRepository
        this.taxRuleRepository = taxRuleRepository
        this.commonService = commonService
    }

    public static getInstance(
        taxGroupRepository: TaxGroupRepository,
        taxRuleRepository: TaxRuleRepository,
        commonService: CommonService
    ): TaxGroupService {
        if (!TaxGroupService.instance) {
            TaxGroupService.instance = new TaxGroupService(
                taxGroupRepository, 
                taxRuleRepository,
                commonService
            );
        }
        return TaxGroupService.instance;
    }

    private isDuplicateTaxGroup(newName: string, existingGroups: ITaxGroup[]): boolean {
        const normalized = newName.trim().toLowerCase();
        return existingGroups.some(group => group.name.trim().toLowerCase() === normalized);
    }


    /**
     * Creates a new tax group
     * @returns newly created tax group
     */
    async createTaxGroup(data: Partial<ITaxGroup>): Promise<ITaxGroup> {
        try {
            /**
             * Verify ownership of user for the hotel
             */
            const isOwner = await this.commonService.verifyOwnership(String(data.createdBy), String(data.hotelId));
            if (!isOwner) throw new Error("You are not the owner of this hotel.");

            /**
             * Check if the hotel ID matches with all the tax rules
             * 
             * This below code is for checking if the tax rules belong to this hotel
             */
            const taxRules = await this.taxRuleRepository.findByHotelAndIds(data.hotelId, data.rules);

            if (taxRules.length !== data.rules.length) {
                throw new Error("One or more tax rules do not belong to the specified hotel.");
            }

            /**
             * Generate a unique tax code and assign it to the tax group data
             */
            data.code = Generator.generateCode(taxGroupPrefix);

            /**
             * Check if the new tax group name matches an existing tax group
             * if not create a new tax group
             */
            const existingTaxGroups = await this.taxGroupRepository.findAll(String(data.hotelId));
            if (existingTaxGroups.length === 0) return await this.taxGroupRepository.create(data);

            if (this.isDuplicateTaxGroup(data.name, existingTaxGroups)) {
                throw new Error("Tax group already exists with this name.");
            }

            return await this.taxGroupRepository.create(data);
        } catch (error: any) {
            console.error("Failed to create tax group at Service Layer:", error);
            throw error;
        }
    }


    async getAllTaxGroups(hotelId: string): Promise<ITaxGroup[]> {
        try {
            return await this.taxGroupRepository.findAll(hotelId);
        } catch (error: any) {
            console.error("Failed to get all tax groups at Service Layer:", error);
            throw error;
        }
    }


    async updateTaxGroup(id: string, data: Partial<ITaxGroup>): Promise<ITaxGroup | null | void> {
        try {
            /**
             * Verify ownership of user for the hotel
             */
            const isOwner = await this.commonService.verifyOwnership(String(data.createdBy), String(data.hotelId));
            if (!isOwner) throw new Error("You are not the owner of this hotel.");
            
            /**
             * Remove fields that are not allowed to be updated
             */
            delete data.createdBy;
            delete data.hotelId;

            const taxGroup = await this.taxGroupRepository.findById(id);
            if (!taxGroup?._id) throw new Error("Tax group not found");

            if (data.rules.length > 0) {
                const taxRules = await this.taxRuleRepository.findByHotelAndIds(taxGroup.hotelId, data.rules);
    
                if (taxRules.length !== data.rules.length) {
                    throw new Error("One or more tax rules do not belong to the specified hotel.");
                }
            }

            if (data.name === taxGroup.name) throw new Error("Tax group name cannot be the same.");

            return await this.taxGroupRepository.update(id, data);
        } catch (error: any) {
            console.error("Failed to update tax group at Service Layer:", error);
            throw error;
        }
    }


    async deleteTaxGroup(id: string): Promise<void> {
        try {
            const taxGroup = await this.taxGroupRepository.findById(id);
            if (!taxGroup?._id) throw new Error("Tax group not found");

            const deleted = await this.taxGroupRepository.delete(id);
            if (!deleted) throw new Error("Unable to delete tax group at this moment.");
        } catch (error: any) {
            console.error("Failed to delete tax group at Service Layer:", error);
            throw error;
        }
    }


    async getTaxGroupById(id: string): Promise<ITaxGroup | null> {
        try {
            const taxGroup = await this.taxGroupRepository.findById(id);
            if (!taxGroup?._id) throw new Error("Tax group not found");

            return taxGroup;
        } catch (error: any) {
            console.error("Failed to get tax group by ID at Service Layer:", error);
            throw error;
        }
    }

}