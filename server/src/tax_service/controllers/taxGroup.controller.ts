import { Request, Response } from "express";
import { ITaxGroup } from "../models";
import { ITaxGroupController, ITaxGroupService, AuthenticatedRequest } from "../interfaces";
import { TaxGroupSanitizer, Validator } from "../utils";


export class TaxGroupController implements ITaxGroupController {
    private taxGroupService: ITaxGroupService;

    constructor(taxGroupService: ITaxGroupService) {
        this.taxGroupService = taxGroupService;
    }

    async create(req: AuthenticatedRequest, res: Response): Promise<Response<ITaxGroup>> {
        try {
            const taxGroupData = req.body;
            const createdBy = req.user?.id;

            /**
             * Validate createdBy user ID
             */
            Validator.validateID(createdBy);
           
            /**
             * Sanitize and validate tax group data
             */
            const sanitizedData = TaxGroupSanitizer.sanitzeCreatePayload({ ...taxGroupData, createdBy });

            /**
             * Create tax group after validation's and sanitization
             */
            const taxGroup = await this.taxGroupService.createTaxGroup(sanitizedData);

            return res.status(201).json({ success: true, data: taxGroup });
        } 
        catch (error: any) {
            console.error("Failed to create tax group at Controller Layer:", error);
            if (
                error.message === "No tax rules found for this hotel." ||
                error.message === "One or more tax rules do not belong to the specified hotel." ||
                error.message === "Tax group already exists with this name."
            ) {
                return res.status(409).json({ error: error.message });
            }
            return res.status(500).json({ sucess: false, message: "Failed to create tax group" });
        }
    }


    /**
     * Fetch all tax groups
     * @returns all tax groups
     */
    async getAll(req: Request, res: Response): Promise<Response<ITaxGroup[]>> {
        try {
            const hotelId = req.params.hotelId;

            /**
             * Validate hotel ID
             */
            Validator.validateID(hotelId);

            const taxGroups = await this.taxGroupService.getAllTaxGroups(hotelId);
            return res.status(200).json({ success: true, data: taxGroups });
        } 
        catch (error: any) {
            console.error("Failed to fetch tax groups at Controller Layer:", error);
            return res.status(500).json({ success: false, message: "Unable to fetch tax groups at this momment." });
        }
    }


    /**
     * Fetch tax group by ID
     * @returns The tax group
     */
    async getById(req: Request, res: Response): Promise<Response<ITaxGroup>> {
        try {
            const { id } = req.params;

            /**
             * Validate tax group ID
             */
            Validator.validateID(id);

            /**
             * Fetch tax group by ID
             */
            const taxGroup = await this.taxGroupService.getTaxGroupById(id);

            return res.status(200).json({ success: true, data: taxGroup });
        } catch (error: any) {
            console.error("Failed to fetch tax group by ID at Controller Layer:", error);
            if (error.message === "Tax group not found") {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ success: false, message: "Unable to fetch tax group at this momment." });
        }
    }

    /**
     * Update tax group
     * @returns The updated tax group
     */
    async update(req: Request, res: Response): Promise<Response<ITaxGroup>> {
        try {
            const { id } = req.params;

            /**
             * Validate tax group ID
             */
            Validator.validateID(id);

            /**
             * Sanitize and validate tax group data
             */
            const sanitizedData = TaxGroupSanitizer.sanitizeUpdatePayload(req.body);

            /**
             * Update tax group after validation's and sanitization
             */
            const taxGroup = await this.taxGroupService.updateTaxGroup(id, sanitizedData);

            return res.status(200).json({ success: true, data: taxGroup });
        } 
        catch (error: any) {
            console.error("Failed to update tax group at Controller Layer:", error);
            if (
                error.message === "Tax group not found" ||
                error.message === "One or more tax rules do not belong to the specified hotel." ||
                error.message === "Tax group name cannot be the same."
            ) {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ success: false, message: "Unable to update tax group at this moment." });
        }
    }


    /**
     * Delete tax group
     * @returns The deleted tax group
     */
    async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            /**
             * Validate tax group ID
             */
            Validator.validateID(id);

            /**
             * Delete tax group
             */
            await this.taxGroupService.deleteTaxGroup(id);

            return res.status(200).json({ success: true, message: "Tax group deleted successfully" });
        } 
        catch (error: any) {
            console.error("Failed to delete tax group at Controller Layer:", error);
            if (error.message === "Tax group not found") {
                return res.status(404).json({ error: error.message });
            }
            return res.status(500).json({ error: "Unable to delete tax group at this momment." });
        }
    }

}