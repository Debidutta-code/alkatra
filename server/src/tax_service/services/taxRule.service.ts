import { ITaxRuleService } from "../interfaces";
import { ITaxRule } from "../models";
import { Generator, Validator } from "../utils";
import { config } from "../../config";
import { TaxRuleRepository } from "../repositories";
import { CommonService } from "../../services";

const { taxRulePrefix } = config.taxSystem;


export class TaxRuleService implements ITaxRuleService {
    private static instance: TaxRuleService;
    private taxRuleRepository: TaxRuleRepository;
    private commonService: CommonService;

    private constructor(
        taxRuleRepository: TaxRuleRepository,
        commonService: CommonService
    ) {
        this.taxRuleRepository = taxRuleRepository;
        this.commonService = commonService
    }

    public static getInstance(
        taxRuleRepository: TaxRuleRepository,
        commonService: CommonService
    ): TaxRuleService {
        if (!TaxRuleService.instance) {
            TaxRuleService.instance = new TaxRuleService(taxRuleRepository, commonService);
        }
        return TaxRuleService.instance;
    }

    private isDuplicateTaxRule(newName: string, existingRules: ITaxRule[]): boolean {
        const normalized = newName.trim().toLowerCase();
        return existingRules.some(rule => rule.name.trim().toLowerCase() === normalized);
    }


    /**
     * Create a new tax rule
     * @returns newly created tax rule
     */
    async createTaxRule(data: Partial<ITaxRule>) {
        try {
            /**
             * Verify ownership of user for the hotel
             */
            const isOwner = await this.commonService.verifyOwnership(String(data.createdBy), String(data.hotelId));
            if (!isOwner) throw new Error("You are not the owner of this hotel.");

            /**
             * Generate a unique tax code and assign it to the tax rule data
             */
            data.code = Generator.generateCode(taxRulePrefix);

            /**
             * Check if the new tax rule name matches an existing tax rule
             * if not create a new tax rule
             */
            const existingTaxRules = await this.taxRuleRepository.findByHotelId(String(data.hotelId));
            if (existingTaxRules.length === 0) return await this.taxRuleRepository.create(data);

            if (this.isDuplicateTaxRule(data.name, existingTaxRules)) {
                throw new Error("Tax rule already exists with this name.");
            }

            return await this.taxRuleRepository.create(data);
        } catch (error: any) {
            console.error("Failed to create tax rule at Create Service Layer:", error);
            throw error;
        }
    }

    async getTaxRuleById(id: string) {
        try {
            const taxRule = await this.taxRuleRepository.findById(id);
            if (!taxRule?._id) throw new Error("Tax rule not found");
            
            return taxRule;
        } catch (error: any) {
            console.error("Failed to get tax rule by ID at Get Service Layer:", error);
            throw error;
        }
    }

    async getAllTaxRules(hotelId: string): Promise<ITaxRule[]> {
        try {
            return await this.taxRuleRepository.findByHotelId(hotelId);
        } catch (error: any) {
            console.error("Failed to get all tax rules at Get Service Layer:", error);
            throw error;
        }
    }

    async updateTaxRule(id: string, data: Partial<ITaxRule>) {
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

            const taxRule = await this.taxRuleRepository.findById(id);
            if (!taxRule?._id) throw new Error("Tax rule not found");

            if (data.name === taxRule.name) throw new Error("Tax rule name cannot be the same.");

            return await this.taxRuleRepository.update(id, data);
        } catch (error: any) {
            console.error("Failed to update tax rule at Update Service Layer:", error);
            throw error;
        }
    }

    async deleteTaxRule(id: string) {
        try {
            const taxRule = await this.taxRuleRepository.findById(id);
            if (!taxRule?._id) throw new Error("Tax rule not found");

            const deleted = await this.taxRuleRepository.delete(id);
            if (!deleted) throw new Error("Unable to delete tax rule at this moment.");
        } catch (error: any) {
            console.error("Failed to delete tax rule at Delete Service Layer:", error);
            throw error;
        }
    }

}