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
// services/stripe.service.ts
const stripe_1 = __importDefault(require("stripe"));
/**
 * Service class to handle all Stripe-related operations
 */
class StripeService {
    constructor() {
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-02-24.acacia',
            typescript: true,
        });
    }
    /**
     * Creates a payment intent for immediate payment processing
     * @param amount Amount in smallest currency unit (cents for USD)
     * @param currency Three-letter currency code
     */
    createPaymentIntent(amount, currency) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                console.log('[Payment] Starting payment intent creation...');
                console.log(`[Payment] Amount: ${amount}, Currency: ${currency}`);
                // Input validation
                if (!amount || amount <= 0) {
                    console.error('[Payment] Validation failed: Invalid amount');
                    return {
                        success: false,
                        error: 'Valid amount is required'
                    };
                }
                if (!currency || currency.length !== 3) {
                    console.error('[Payment] Validation failed: Invalid currency');
                    return {
                        success: false,
                        error: 'Valid 3-letter currency code is required'
                    };
                }
                console.log('[Payment] Calling Stripe API to create payment intent...');
                const paymentIntent = yield this.stripe.paymentIntents.create({
                    amount,
                    currency,
                    automatic_payment_methods: { enabled: true },
                });
                console.log('[Payment] Payment intent created successfully');
                console.log(`[Payment] Client secret: ${(_a = paymentIntent.client_secret) === null || _a === void 0 ? void 0 : _a.substring(0, 10)}...`);
                console.log(`[Payment] Payment intent ID: ${paymentIntent.id}`);
                return {
                    success: true,
                    clientSecret: paymentIntent.client_secret
                };
            }
            catch (error) {
                console.error('[Payment] Error creating payment intent:');
                console.error('--- Error Details ---');
                console.error('Message:', error.message);
                console.error('Type:', error.type || 'N/A');
                console.error('Code:', error.code || 'N/A');
                console.error('Stack:', error.stack || 'N/A');
                console.error('Raw:', error.raw || 'N/A');
                console.error('---------------------');
                return {
                    success: false,
                    error: error.message || 'An error occurred while creating the payment intent',
                    details: {
                        type: error.type,
                        code: error.code,
                        statusCode: error.statusCode
                    }
                };
            }
        });
    }
    /**
     * Creates a setup intent for storing payment details
     */
    createSetupIntent() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const setupIntent = yield this.stripe.setupIntents.create({
                    usage: 'off_session',
                });
                return {
                    success: true,
                    clientSecret: setupIntent.client_secret
                };
            }
            catch (error) {
                console.error('Setup Intent Error:', error);
                return {
                    success: false,
                    error: error.message || 'An error occurred while creating the setup intent'
                };
            }
        });
    }
    /**
     * Creates or retrieves a customer and attaches a payment method
     * @param email Customer email
     * @param name Customer name
     * @param phone Customer phone
     * @param paymentMethodId Stripe payment method ID
     */
    createOrRetrieveCustomer(email, name, phone, paymentMethodId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Input validation
                if (!email || !paymentMethodId) {
                    return {
                        success: false,
                        error: 'Email and payment method ID are required'
                    };
                }
                // Check if customer already exists
                const existingCustomers = yield this.stripe.customers.list({
                    email: email,
                    limit: 1
                });
                let customerId;
                if (existingCustomers.data.length > 0) {
                    customerId = existingCustomers.data[0].id;
                    try {
                        yield this.stripe.paymentMethods.attach(paymentMethodId, {
                            customer: customerId
                        });
                    }
                    catch (error) {
                        if (error.code !== 'payment_method_already_attached') {
                            throw error;
                        }
                    }
                }
                else {
                    const newCustomer = yield this.stripe.customers.create({
                        email,
                        name,
                        phone,
                        payment_method: paymentMethodId
                    });
                    customerId = newCustomer.id;
                }
                // Set as default payment method
                yield this.stripe.customers.update(customerId, {
                    invoice_settings: {
                        default_payment_method: paymentMethodId
                    }
                });
                return { success: true, customerId };
            }
            catch (error) {
                console.error('Customer Management Error:', error);
                return {
                    success: false,
                    error: error.message || 'An error occurred while managing customer data'
                };
            }
        });
    }
    /**
     * Charges a saved payment method for a customer
     * @param customerId Stripe customer ID
     * @param amount Amount in smallest currency unit (cents for USD)
     * @param currency Three-letter currency code
     * @param description Description of the charge
     */
    chargeCustomer(customerId, paymentMethodId, amount, currency, description) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!customerId || !paymentMethodId) {
                    return {
                        success: false,
                        error: 'Customer ID and payment method ID are required'
                    };
                }
                const paymentIntent = yield this.stripe.paymentIntents.create({
                    amount,
                    currency,
                    customer: customerId,
                    payment_method: paymentMethodId,
                    confirm: true,
                    description,
                    off_session: true
                });
                return { success: true, paymentIntent };
            }
            catch (error) {
                console.error('Charge Customer Error:', error);
                // Handle authentication required error specifically
                if (error.code === 'authentication_required') {
                    return {
                        success: false,
                        error: 'This payment requires authentication. Please try a different payment method.'
                    };
                }
                return {
                    success: false,
                    error: error.message || 'An error occurred while processing the payment'
                };
            }
        });
    }
    /**
     * Get direct access to the Stripe instance
     */
    getInstance() {
        return this.stripe;
    }
}
// Create a singleton instance
const stripeService = new StripeService();
exports.default = stripeService;
//# sourceMappingURL=stripe.service.js.map