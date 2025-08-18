import { Request, Response } from "express";
import { ITaxRule } from "../models";

export interface ITaxRuleRepository {
    create(data: Partial<ITaxRule>): Promise<ITaxRule>;
    findAll(id: string): Promise<ITaxRule[]>;
    update(id: string, data: Partial<ITaxRule>): Promise<ITaxRule | null>;
    delete(id: string): Promise<boolean>;
    findById(id: string): Promise<ITaxRule | null>;
}

export interface ITaxRuleService {
    createTaxRule(data: Partial<ITaxRule>): Promise<ITaxRule>;
    getAllTaxRules(hotelId: string): Promise<ITaxRule[]>;
    updateTaxRule(id: string, data: Partial<ITaxRule>): Promise<ITaxRule | null>;
    deleteTaxRule(id: string): Promise<void>;
    getTaxRuleById(id: string): Promise<ITaxRule | null>;
}

export interface ITaxRuleController {
    create(req: Request, res: Response): Promise<Response<ITaxRule>>;
    getAll(req: Request, res: Response): Promise<Response<ITaxRule[]>>;
    update(req: Request, res: Response): Promise<Response<ITaxRule>>;
    delete(req: Request, res: Response): Promise<Response>;
}