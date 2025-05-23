// types/custom.ts
import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    _id?: string; 
  };
}
