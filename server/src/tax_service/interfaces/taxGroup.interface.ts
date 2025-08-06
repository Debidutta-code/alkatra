import { Request, Response } from "express";
import { ITaxGroup } from "../models";

export interface ITaxGroupRepository {
    create(data: Partial<ITaxGroup>): Promise<ITaxGroup>;
    findAll(hotelId: string): Promise<ITaxGroup[]>;
    update(id: string, data: Partial<ITaxGroup>): Promise<ITaxGroup | null>;
    delete(id: string): Promise<boolean>;
    findById(id: string): Promise<ITaxGroup | null>;
}

export interface ITaxGroupService {
    createTaxGroup(data: Partial<ITaxGroup>): Promise<ITaxGroup>;
    getAllTaxGroups(hotelId: string): Promise<ITaxGroup[]>;
    updateTaxGroup(id: string, data: Partial<ITaxGroup>): Promise<ITaxGroup | null | void>;
    deleteTaxGroup(id: string): Promise<void>;
    getTaxGroupById(id: string): Promise<ITaxGroup | null>;
}

export interface ITaxGroupController {
    create(req: Request, res: Response): Promise<Response<ITaxGroup>>;
    getAll(req: Request, res: Response): Promise<Response<ITaxGroup[]>>;
    update(req: Request, res: Response): Promise<Response<ITaxGroup>>;
    delete(req: Request, res: Response): Promise<Response<boolean>>;
}