import Razorpay from 'razorpay';

// Define the types for the configuration
interface RazorpayInstanceConfig {
  key_id: string;
  key_secret: string;
}

// Create and export the instance
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
} as RazorpayInstanceConfig);

export { instance };