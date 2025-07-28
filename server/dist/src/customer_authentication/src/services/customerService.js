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
// src/services/customerService.ts
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const customerRepository_1 = __importDefault(require("../repositories/customerRepository"));
const passwordValidator_1 = require("../utils/passwordValidator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class CustomerService {
    // new customer register
    registerCustomer(customerData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { firstName, lastName, email, password, phone } = customerData;
            if (!firstName || !lastName || !email || !password) {
                const errors = {
                    firstName: !firstName ? "Firstname is required" : null,
                    lastName: !lastName ? "Lastname is required" : null,
                    email: !email ? "Email is required" : null,
                    password: !password ? "Password is required" : null,
                };
                throw new Error(JSON.stringify({ message: "All fields are required", errors }));
            }
            if (!(0, passwordValidator_1.isValidPassword)(password)) {
                throw new Error("Password must be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.");
            }
            const existingCustomer = yield customerRepository_1.default.findByEmail(email);
            if (existingCustomer) {
                throw new Error("Customer already registered");
            }
            const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
            const newCustomer = yield customerRepository_1.default.create({
                firstName,
                lastName,
                email,
                phone,
                password: hashedPassword,
                role: "customer",
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            return newCustomer;
        });
    }
    // Login customer
    loginCustomer(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email || !password) {
                const errors = {
                    email: !email ? "Email is required" : null,
                    password: !password ? "Password is required" : null,
                };
                throw new Error(JSON.stringify({ message: "Email and password are required", errors }));
            }
            const customer = yield customerRepository_1.default.findByEmail(email);
            if (!customer) {
                throw new Error("Invalid email or password");
            }
            const isPasswordValid = yield bcryptjs_1.default.compare(password, customer.password);
            if (!isPasswordValid) {
                throw new Error("Invalid email or password");
            }
            const token = jsonwebtoken_1.default.sign({ id: customer._id, email: customer.email, role: customer.role }, process.env.JWT_SECRET_KEY || "your-secret-key", { expiresIn: "7d" });
            return { token, customer };
        });
    }
    // Get all customers
    getAllCustomers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield customerRepository_1.default.findAll();
            }
            catch (error) {
                throw new Error("Error retrieving customers");
            }
        });
    }
    // Get customer by ID
    getCustomerOwnData(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const secretKey = process.env.JWT_SECRET_KEY || "your_secret_key";
                const decoded = jsonwebtoken_1.default.verify(token, secretKey);
                if (!decoded.id) {
                    throw new Error("Invalid token: missing ID");
                }
                let customer = yield customerRepository_1.default.findById(decoded.id);
                if (!customer) {
                    if (!customer) {
                        customer = yield this.getGoogleCustomerOwnData(token);
                        return customer;
                    }
                }
                return customer;
            }
            catch (error) {
                throw new Error(`Error retrieving customer: ${error.message}`);
            }
        });
    }
    getGoogleCustomerOwnData(token) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const secretKey = process.env.JWT_SECRET_KEY || "your_secret_key";
                const decoded = jsonwebtoken_1.default.verify(token, secretKey);
                if (!decoded.id) {
                    throw new Error("Invalid token: missing ID");
                }
                const customer = yield customerRepository_1.default.findByIdFromGoogleUserCollection(decoded.id);
                if (!customer) {
                    throw new Error("Customer details not found");
                }
                const [firstName, ...rest] = ((_a = customer.displayName) === null || _a === void 0 ? void 0 : _a.split(" ")) || ["Unknown"];
                const lastName = rest.join(" ") || "";
                return {
                    _id: customer._id,
                    firstName,
                    lastName,
                    email: customer.email,
                    avatar: customer.avatar || null
                };
            }
            catch (error) {
                throw new Error(`Error retrieving customer: ${error.message}`);
            }
        });
    }
    // Update customer profile
    updateCustomerProfile(customerId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield customerRepository_1.default.updateProfile(customerId, updateData);
        });
    }
    // Check if email exists
    checkEmailExists(email) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email) {
                throw new Error("Email is required");
            }
            const customer = yield customerRepository_1.default.findByEmail(email);
            if (!customer) {
                throw new Error("Email not found");
            }
            return { email: customer.email };
        });
    }
    // Update customer password
    updatePassword(email, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!email || !newPassword) {
                throw new Error("Email and new password are required");
            }
            const customer = yield customerRepository_1.default.findByEmail(email);
            if (!customer) {
                throw new Error("Customer not found");
            }
            if (!(0, passwordValidator_1.isValidPassword)(newPassword)) {
                throw new Error("Password must be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.");
            }
            const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
            const updatedCustomer = yield customerRepository_1.default.updatePassword(customer.id, hashedPassword);
            if (!updatedCustomer) {
                throw new Error("Failed to update password");
            }
        });
    }
}
exports.default = new CustomerService();
//# sourceMappingURL=customerService.js.map