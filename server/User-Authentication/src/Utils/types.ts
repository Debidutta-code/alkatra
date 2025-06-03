import { Request as ExpressRequest } from "express";
import { Role } from "./jwtHelper";

export interface CustomRequest extends ExpressRequest {
  user?: string;
  role?: Role;
  jwt?: string;
}
