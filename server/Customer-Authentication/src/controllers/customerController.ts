// src/controllers/customerController.ts
import { Request, Response } from "express";
import customerService from "../services/customerService";
import { AuthenticatedRequest } from "../types/custom";

class CustomerController {

  // Register a new customer
  async registerCustomer(req: Request, res: Response): Promise<void> {
    try {
      const customer = await customerService.registerCustomer(req.body);
      res.status(201).json({ message: "Customer registered successfully", data: customer });
    } catch (error: any) {
      try {
        const parsedError = JSON.parse(error.message);
        res.status(400).json(parsedError);
      } catch (e) {
        res.status(error.message === "Customer already registered" ? 400 : 500).json({
          message: error.message,
        });
      }
    }
  }

  // Customer login
  async loginCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const { token, customer } = await customerService.loginCustomer(email, password);
      res.status(200).json({
        message: "Login successful",
        token,
        data: {
          id: customer._id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          role: customer.role,
        },
      });
    } catch (error: any) {
      try {
        const parsedError = JSON.parse(error.message);
        res.status(400).json(parsedError);
      } catch (e) {
        res.status(400).json({ message: error.message });
      }
    }
  }

  // Get all customers
  async getAllCustomers(req: Request, res: Response): Promise<void> {
    try {
      const customers = await customerService.getAllCustomers();
      res.status(200).json({ message: "Customers retrieved successfully", data: customers });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving customers", error });
    }
  }

  // get customer by ID
  async getCustomerOwnData(req: Request, res: Response): Promise<void> {
    try {
      const token = req.header("Authorization")?.split(" ")[1];
      if (!token) {
        res.status(401).json({ message: "Access denied. No token provided." });
        return;
      }
      const customer = await customerService.getCustomerOwnData(token);
      if (!customer) {
        res.status(404).json({ message: "Customer not found" });
        return;
      }
      res.status(200).json({ message: "Customer retrieved successfully", data: customer });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving customer", error });
    }
  }

  // Update customer profile
  async updateCustomerProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { firstName, lastName, phone, email, password } = req.body;
      const customerId = req.user?.id;

      if (!customerId) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const customer = await customerService.updateCustomerProfile(customerId, { firstName, lastName, phone, email, password });
      if (!customer) {
        res.status(404).json({ message: "Customer not found" });
        return;
      }

      res.status(200).json({ message: "Profile updated successfully", data: customer });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "Email already exists") {
          res.status(400).json({ message: error.message });
        } else {
          res.status(500).json({ message: "Error updating profile", error });
        }
      } else {
        res.status(500).json({ message: "An unknown error occurred" });
      }
    }
  }

  // Check if email exists
  async checkEmailExists(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const result = await customerService.checkEmailExists(email);
      res.status(200).json({ message: "You are authorized", ...result });
    } catch (error: any) {
      const status = error.message === "Email not found" ? 404 : 400;
      res.status(status).json({ message: error.message });
    }
  }

  // Update customer password
  async updatePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email, newPassword } = req.body;
      const customerId = req.user?.id;

      await customerService.updatePassword(email, newPassword, customerId || "");
      res.status(200).json({ message: "Password updated successfully" });
    } catch (error: any) {
      const statusMap: Record<string, number> = {
        "Customer not found": 404,
        "Unauthorized: No customer ID provided": 401,
        "You are not allowed to update this password": 403,
        "Email and new password are required": 400,
        "Password must be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.": 400,
      };
      const status = statusMap[error.message] || 500;
      res.status(status).json({ message: error.message });
    }
  }
}

export default new CustomerController();
