// src/services/customerService.ts
import bcrypt from "bcryptjs";
import customerRepository from "../repositories/customerRepository";
import { isValidPassword } from "../utils/passwordValidator";
import { ICustomer } from "../models/customer.model";
import jwt from "jsonwebtoken";
import { UserMessageRepository } from "../repositories";
import { IUserMessage } from "../interfaces/userMessage.interface";

class CustomerService {
    private userMessageRepository: UserMessageRepository;

    constructor() {
        this.userMessageRepository = UserMessageRepository.getInstance();
    }


    // new customer register
    async registerCustomer(customerData: Partial<ICustomer>): Promise<ICustomer> {
        const { firstName, lastName, email, password, phone } = customerData;
        if (!firstName || !lastName || !email || !password) {
            const errors: Record<string, string | null> = {
                firstName: !firstName ? "Firstname is required" : null,
                lastName: !lastName ? "Lastname is required" : null,
                email: !email ? "Email is required" : null,
                password: !password ? "Password is required" : null,
            };
            throw new Error(JSON.stringify({ message: "All fields are required", errors }));
        }
        if (!isValidPassword(password)) {
            throw new Error(
                "Password must be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
            );
        }
        const existingCustomer = await customerRepository.findByEmail(email);
        if (existingCustomer) {
            throw new Error("Customer already registered");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newCustomer: any = await customerRepository.create({
            firstName,
            lastName,
            email,
            phone,
            password: hashedPassword,
            role: "customer",
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const sanitizedCustomer = newCustomer.toObject();
        delete sanitizedCustomer.password;

        return sanitizedCustomer;
    }

    // Login customer
    async loginCustomer(email: string, password: string): Promise<{ token: string; customer: ICustomer }> {
        if (!email || !password) {
            const errors: Record<string, string | null> = {
                email: !email ? "Email is required" : null,
                password: !password ? "Password is required" : null,
            };
            throw new Error(JSON.stringify({ message: "Email and password are required", errors }));
        }
        const customer = await customerRepository.findByEmail(email);
        if (!customer) {
            throw new Error("Invalid email or password");
        }
        const isPasswordValid = await bcrypt.compare(password, customer.password);
        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        }
        const token = jwt.sign(
            { id: customer._id, email: customer.email, role: customer.role },
            process.env.JWT_SECRET_KEY || "your-secret-key",
            { expiresIn: "7d" }
        );
        return { token, customer };
    }

    // Get all customers
    async getAllCustomers(): Promise<ICustomer[]> {
        try {
            return await customerRepository.findAll();
        } catch (error) {
            throw new Error("Error retrieving customers");
        }
    }

    // Get customer by ID
    async getCustomerOwnData(token: string): Promise<ICustomer | null> {
        try {
            const secretKey = process.env.JWT_SECRET_KEY || "your_secret_key";
            const decoded = jwt.verify(token, secretKey) as { id: string };

            if (!decoded.id) {
                throw new Error("Invalid token: missing ID");
            }

            let customer = await customerRepository.findById(decoded.id);
            if (!customer) {
                throw new Error ("Customer not found");
            }
            return customer;
        } catch (error: any) {
            throw new Error(`Error retrieving customer: ${error.message}`);
        }
    }

    // Update customer profile
    async updateCustomerProfile(customerId: string, updateData: Partial<ICustomer>): Promise<ICustomer | null> {
        return await customerRepository.updateProfile(customerId, updateData);
    }

    // Check if email exists
    async checkEmailExists(email: string): Promise<{ email: string }> {
        if (!email) {
            throw new Error("Email is required");
        }
        const customer = await customerRepository.findByEmail(email);
        if (!customer) {
            throw new Error("Email not found");
        }
        return { email: customer.email };
    }

    // Update customer password
    async updatePassword(
        email: string,
        newPassword: string,
        // customerId: string
    ): Promise<void> {
        if (!email || !newPassword) {
            throw new Error("Email and new password are required");
        }

        const customer = await customerRepository.findByEmail(email);
        if (!customer) {
            throw new Error("Customer not found");
        }

        if (!isValidPassword(newPassword)) {
            throw new Error(
                "Password must be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
            );
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedCustomer = await customerRepository.updatePassword(customer.id, hashedPassword);
        if (!updatedCustomer) {
            throw new Error("Failed to update password");
        }
    }


    /**
     * Handle customer connect request
     */
    async handleCustomerConnectRequest(data: IUserMessage) {
        try {
            const payload: IUserMessage = {
                name: data.name,
                email: data.email,
                reason: data.reason
            }

            const message = await this.userMessageRepository.create(payload);
            if (!message) throw new Error("Failed to handle customer connect request");

            // send email to user for successful connection
        } catch (error: any) {
            console.log("Failed to handle customer connect request", error);
            throw error;
        }
    }


    /**
     * Find user by it's ID
     */
    async findById(id: string): Promise<ICustomer | null> {
        return await customerRepository.findById(id);
    }

}

export default new CustomerService();