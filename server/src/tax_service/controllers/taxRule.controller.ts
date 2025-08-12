import { Request, Response } from "express";
import { ITaxRuleController, ITaxRuleService, AuthenticatedRequest } from "../interfaces";
import { TaxRuleSanitizer, Validator } from "../utils";


export class TaxRuleController implements ITaxRuleController {
    private taxRuleService: ITaxRuleService;

    constructor(taxRuleService: ITaxRuleService) {
        this.taxRuleService = taxRuleService;
    }

    /**
     * Create a new tax rule
     * @returns The created tax rule
     */
    public create = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const taxRuleData = req.body;
            const createdBy = req.user?.id;

            /**
             * Check if payload is empty
             */
            if (Object.keys(taxRuleData).length === 0) throw new Error("Update payload cannot be empty."); 

            /**
             * Validate createdBy user ID
             */
            Validator.validateID(createdBy);

            /**
             * Sanitize and validate tax rule data
             */
            const sanitizedPayload = TaxRuleSanitizer.sanitizeCreatePayload({ ...taxRuleData, createdBy });

            /**
             * Create tax rule after validation's and sanitization
             */
            const taxRule = await this.taxRuleService.createTaxRule(sanitizedPayload);

            return res.status(201).json({ success: true, data: taxRule });
        } 
        catch (error) {
            console.error("Failed to create tax rule at Controller Layer:", error);
            if (
                error.message === "Update payload cannot be empty." ||
                error.message === "No tax rules found for this hotel." ||
                error.message === "You are not the owner of this hotel." ||
                error.message === "One or more tax rules do not belong to the specified hotel." ||
                error.message === "Tax rule already exists with this name."
            ) {
                return res.status(409).json({ success: false, message: error.message });
            }
            return res.status(500).json({ success: false, message: "Unable to create tax rule at this momment." });
        }
    };  


    /**
     * Get a tax rule by ID
     * @returns The tax rule
     */
    public getById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            /**
             * Validate tax rule ID
             */
            Validator.validateID(id);

            /**
             * Get tax rule by ID after validation
             */
            const taxRule = await this.taxRuleService.getTaxRuleById(id);

            return res.status(200).json({ success: true, data: taxRule });
        } 
        catch (error) {
            console.error("Failed to get tax rule by ID:", error);
            if (error.message === "Tax rule not found") {
                return res.status(404).json({ success: false, message: error.message });
            }
            return res.status(500).json({ success: false, message: "Unable to get tax rule at this momment." });
        }
    };


    /**
     * Get all tax rules for a hotel
     * @returns All tax rules
     */
    public getAll = async (req: Request, res: Response) => {
        try {
            const hotelId = req.params.hotelId;

            /**
             * Validate hotel ID
             */
            Validator.validateID(hotelId);

            const taxRules = await this.taxRuleService.getAllTaxRules(hotelId);
            return res.status(200).json({ success: true, data: taxRules });
        } 
        catch (error) {
            console.error("Failed to get all tax rules:", error);
            return res.status(500).json({ success: false, message: "Unable to get all tax rules at this momment." });
        }
    };


    /**
     * Update a tax rule
     * @returns The updated tax rule
     */
    public update = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const { id } = req.params;
            const updatePayload = req.body;
            const createdBy = req.user?.id;

            /**
             * Check if update payload is empty
             */
            if (Object.keys(updatePayload).length === 0) throw new Error("Update payload cannot be empty.");

            /**
             * Check if the hotel ID present in the payload
             */
            if (!updatePayload.hotelId) throw new Error("Hotel ID is required.");

            /**
             * Validate tax rule ID
             */
            Validator.validateID(id);

            /**
             * Sanitize and validate tax rule data
             */
            const sanitizedPayload = TaxRuleSanitizer.sanitizeUpdatePayload({ ...updatePayload, createdBy });

            /**
             * Update tax rule after validation's and sanitization
             */
            const updated = await this.taxRuleService.updateTaxRule(id, sanitizedPayload);

            return res.status(200).json({ success: true, data: updated });
        } 
        catch (error) {
            console.error("Failed to update tax rule:", error);
            if (
                error.message === "Update payload cannot be empty." ||
                error.message === "Hotel ID is required." ||
                error.message === "Tax rule not found" ||
                error.message === "You are not the owner of this hotel." ||
                error.message === "Tax rule name cannot be the same."
            ) {
                return res.status(409).json({ success: false, message: error.message });
            }
            return res.status(500).json({ success: false, message: "Unable to update tax rule at this moment." });
        }
    };


    /**
     * Delete a tax rule
     * @returns message of delete operation
     */
    public delete = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;

            /**
             * Validate tax rule ID
             */
            Validator.validateID(id);

            /**
             * Delete tax rule after validation
             */
            await this.taxRuleService.deleteTaxRule(id);

            return res.status(200).json({ success: true, message: "Deleted successfully" });
        } 
        catch (error) {
            console.error("Failed to delete tax rule:", error);
            if (error.message === "Tax rule not found") {
                return res.status(404).json({ success: false, message: error.message });
            }
            return res.status(500).json({ success: false, message: "Unable to delete tax rule at this moment." });
        }
    };
}
