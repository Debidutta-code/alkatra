"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/repositories/customerRepository.ts
const customer_model_1 = __importDefault(require("../models/customer.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const googleUser_model_1 = require("../models/googleUser.model");
class CustomerRepository {
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield customer_model_1.default.findOne({ email });
        });
    }
    // Create a new customer
    create(customerData) {
        return __awaiter(this, void 0, void 0, function* () {
            const customer = new customer_model_1.default(customerData);
            return yield customer.save();
        });
    }
    // Get all customers
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield customer_model_1.default.find();
        });
    }
    // Get customer by ID
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield customer_model_1.default.findById(id);
        });
    }
    // Get customer by ID from Google user collection
    findByIdFromGoogleUserCollection(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield googleUser_model_1.GoogleUser.findById(id);
        });
    }
    // Update customer profile
    updateProfile(customerId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const customer = yield customer_model_1.default.findById(customerId);
            if (!customer) {
                return null;
            }
            if (updateData.email && updateData.email !== customer.email) {
                const existingCustomer = yield customer_model_1.default.findOne({ email: updateData.email });
                if (existingCustomer) {
                    throw new Error("Email already exists");
                }
                customer.email = updateData.email;
            }
            if (updateData.firstName)
                customer.firstName = updateData.firstName;
            if (updateData.lastName)
                customer.lastName = updateData.lastName;
            if (updateData.phone)
                customer.phone = updateData.phone;
            if (updateData.password) {
                customer.password = yield bcryptjs_1.default.hash(updateData.password, 10);
            }
            yield customer.save();
            return customer;
        });
    }
    // Update customer password
    updatePassword(id, hashedPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield customer_model_1.default.findByIdAndUpdate(id, { password: hashedPassword, updatedAt: new Date() }, { new: true } // Return the updated document
            );
        });
    }
}
exports.default = new CustomerRepository();
//# sourceMappingURL=customerRepository.js.map