// src/repositories/customerRepository.ts
import Customer, { ICustomer } from "../models/customer.model";
import bcrypt from "bcryptjs";

class CustomerRepository {
    async findByEmail(email: string): Promise<ICustomer | null> {
        return await Customer.findOne({ email });
    }

    // Create a new customer
    async create(customerData: Partial<ICustomer>): Promise<ICustomer> {
        const customer = new Customer(customerData);
        return await customer.save();
    }

    // Get all customers
    async findAll(): Promise<ICustomer[]> {
        return await Customer.find();
    }

    // Get customer by ID
    async findById(id: string): Promise<ICustomer | null> {
        return await Customer.findById(id);
    }

    // Update customer profile
    async updateProfile(customerId: string, updateData: Partial<ICustomer>): Promise<ICustomer | null> {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return null;
        }
        if (updateData.firstName) customer.firstName = updateData.firstName;
        if (updateData.lastName) customer.lastName = updateData.lastName;
        if (updateData.phone) customer.phone = updateData.phone;
        if (updateData.password) {
            customer.password = await bcrypt.hash(updateData.password, 10);
        }
        await customer.save();
        return customer;
    }

    // Update customer password
    async updatePassword(id: string, hashedPassword: string): Promise<ICustomer | null> {
        return await Customer.findByIdAndUpdate(
            id,
            { password: hashedPassword, updatedAt: new Date() },
            { new: true } // Return the updated document
        );
    }

    /**
     * Update customer information for referrals
     */
    async updateReferralInfo(customerId: string, referralCode: string, referralLink: string, referralQRCode: string): Promise<ICustomer | null> {
        return await Customer.findByIdAndUpdate(
            customerId,
            {
                referralCode: referralCode,
                referralLink: referralLink,
                referralQRCode: referralQRCode,
                updatedAt: new Date()
            },
            { new: true } // Return the updated document
        );
    }
}

export default new CustomerRepository();