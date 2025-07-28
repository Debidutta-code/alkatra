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
const customerService_1 = __importDefault(require("../services/customerService"));
class CustomerController {
    // Register a new customer
    registerCustomer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const customer = yield customerService_1.default.registerCustomer(req.body);
                res.status(201).json({ message: "Customer registered successfully", data: customer });
            }
            catch (error) {
                try {
                    const parsedError = JSON.parse(error.message);
                    res.status(400).json(parsedError);
                }
                catch (e) {
                    res.status(error.message === "Customer already registered" ? 400 : 500).json({
                        message: error.message,
                    });
                }
            }
        });
    }
    // Customer login
    loginCustomer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const { token, customer } = yield customerService_1.default.loginCustomer(email, password);
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
            }
            catch (error) {
                try {
                    const parsedError = JSON.parse(error.message);
                    res.status(400).json(parsedError);
                }
                catch (e) {
                    res.status(400).json({ message: error.message });
                }
            }
        });
    }
    // Get all customers
    getAllCustomers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const customers = yield customerService_1.default.getAllCustomers();
                res.status(200).json({ message: "Customers retrieved successfully", data: customers });
            }
            catch (error) {
                res.status(500).json({ message: "Error retrieving customers", error });
            }
        });
    }
    // get customer by ID
    getCustomerOwnData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
                if (!token) {
                    res.status(401).json({ message: "Access denied. No token provided." });
                    return;
                }
                const customer = yield customerService_1.default.getCustomerOwnData(token);
                if (!customer) {
                    res.status(404).json({ message: "Customer not found" });
                    return;
                }
                res.status(200).json({ message: "Customer retrieved successfully", data: customer });
            }
            catch (error) {
                res.status(500).json({ message: "Error retrieving customer", error });
            }
        });
    }
    // Update customer profile
    updateCustomerProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { firstName, lastName, phone, email, password } = req.body;
                const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!customerId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const customer = yield customerService_1.default.updateCustomerProfile(customerId, { firstName, lastName, phone, email, password });
                if (!customer) {
                    res.status(404).json({ message: "Customer not found" });
                    return;
                }
                res.status(200).json({ message: "Profile updated successfully", data: customer });
            }
            catch (error) {
                if (error instanceof Error) {
                    if (error.message === "Email already exists") {
                        res.status(400).json({ message: error.message });
                    }
                    else {
                        res.status(500).json({ message: "Error updating profile", error });
                    }
                }
                else {
                    res.status(500).json({ message: "An unknown error occurred" });
                }
            }
        });
    }
    // Check if email exists
    checkEmailExists(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const result = yield customerService_1.default.checkEmailExists(email);
                res.status(200).json(Object.assign({ message: "You are authorized" }, result));
            }
            catch (error) {
                const status = error.message === "Email not found" ? 404 : 400;
                res.status(status).json({ message: error.message });
            }
        });
    }
    // Update customer password
    updatePassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, newPassword } = req.body;
                yield customerService_1.default.updatePassword(email, newPassword);
                res.status(200).json({ message: "Password updated successfully" });
            }
            catch (error) {
                const statusMap = {
                    "Customer not found": 404,
                    "Unauthorized: No customer ID provided": 401,
                    "You are not allowed to update this password": 403,
                    "Email and new password are required": 400,
                    "Password must be at least 8 characters long and include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.": 400,
                };
                const status = statusMap[error.message] || 500;
                res.status(status).json({ message: error.message });
            }
        });
    }
}
exports.default = new CustomerController();
//# sourceMappingURL=customerController.js.map