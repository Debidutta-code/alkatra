// utils/stripe.utils.ts
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion, // Adjust based on your version
});

export const createStripeSetupIntent = async () => {
  try {
    const setupIntent = await stripe.setupIntents.create({
      usage: 'off_session', // Allow using this payment method later
    });
    
    return { success: true, clientSecret: setupIntent.client_secret };
  } catch (error: any) {
    console.error('Error creating setup intent:', error);
    return { success: false, error: error.message };
  }
};

export const createOrRetrieveCustomer = async (
  email: string,
  name: string,
  phone: string,
  paymentMethodId: string
) => {
  try {
    // Check if customer already exists
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1
    });
    
    let customerId: string;
    
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
      
      // Try to attach the payment method to the customer
      try {
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: customerId
        });
      } catch (error: any) {
        // If the error is because the payment method is already attached, that's fine
        if (error.code !== 'payment_method_already_attached') {
          throw error;
        }
      }
    } else {
      // Create a new customer with the payment method
      const newCustomer = await stripe.customers.create({
        email: email,
        name: name,
        phone: phone,
        payment_method: paymentMethodId
      });
      
      customerId = newCustomer.id;
    }
    
    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });
    
    return { success: true, customerId };
  } catch (error: any) {
    console.error('Error handling Stripe customer:', error);
    return { success: false, error: error.message };
  }
};

export default stripe;