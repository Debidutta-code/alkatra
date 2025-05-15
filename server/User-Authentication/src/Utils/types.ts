import { Request as ExpressRequest } from "express";

export interface CustomRequest extends ExpressRequest {
  user?: string;
  role?: string;
  jwt?: string;
}