// src/repositories/customerRepository.ts
import Customer, { ICustomer } from "../models/customer.model";
import { DeletedCustomerModel, IDeletedCustomer } from "../models";
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
        if (!id) {
            throw new Error("REPOSITORY: Customer ID is required");
        }
        
        return await Customer.findById(id);
    }

    // Update customer profile
    async updateProfile(customerId: string, updateData: Partial<ICustomer>): Promise<ICustomer | null> {
        try {
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
        catch (error) {
            console.log("Failed to update customer profile", error);
            throw new Error("Failed to update customer profile");
        }
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

    /**
     * Store customer details before delete in customer deletion model
     * @param deletedCustomerData 
     * @returns
     */
    async storeDeletedCustomer(deletedCustomerData: Partial<IDeletedCustomer>): Promise<any> {
        try {
            if (!deletedCustomerData) {
                throw new Error("No customer data provided for deletion");
            }

            const storedData = new DeletedCustomerModel({
                googleId: deletedCustomerData.googleId || "",
                provider: deletedCustomerData.provider || "",
                avatar: deletedCustomerData.avatar || "",
                firstName: deletedCustomerData.firstName || "",
                lastName: deletedCustomerData.lastName || "",
                email: deletedCustomerData.email?.toLowerCase().trim() || "",
                phone: deletedCustomerData.phone?.trim() || "",
                password: deletedCustomerData.password || "",
                address: deletedCustomerData.address || "",
                role: deletedCustomerData.role || "",
                referralCode: deletedCustomerData.referralCode || "",
                referralLink: deletedCustomerData.referralLink || "",
                referralQRCode: deletedCustomerData.referralQRCode || "",
            });

            // const storeData = new DeletedCustomerModel(deletedCustomerData);

            return await storedData.save();
        }
        catch (error: any) {
            console.log("REPOSITORY: Failed to store deleted customer data", error);
            throw new Error("Failed to store deleted customer data");
        }
    }

    /**
     * Find customer by ID and delete
     * @param id 
     * @returns 
     */
    async findByIdAndDelete(id: string) {
        try {
            if (!id) {
                throw new Error("Customer ID is required");
            }
            return await Customer.findByIdAndDelete(id);
        }
        catch (error: any) {
            console.log("REPOSITORY: Failed to delete customer", error);
            throw new Error("Failed to delete customer");
        }
    }
}

export default new CustomerRepository();