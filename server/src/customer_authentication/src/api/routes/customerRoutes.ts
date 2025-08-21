import { Router } from "express";
import { authenticateCustomer } from "../../middleware/authMiddleware";
// import CustomerController from "../../controllers/customerController";
import CustomerController from "../../controllers/customer.controller";
import verificationOtpController from "../../controllers/verificationOtp.controller";
import { SMSController } from "../../controllers/sms.controller";

const router = Router();
const smsController = new SMSController();


// router.post("/register", CustomerController.clientProviderCheck);
router.post("/register", CustomerController.registerCustomer.bind(CustomerController));
router.post("/login", CustomerController.loginCustomer);
router.get("/all", authenticateCustomer, CustomerController.getAllCustomers);
router.get("/me", authenticateCustomer, CustomerController.getCustomerOwnData);
router.patch("/update", authenticateCustomer, CustomerController.updateCustomerProfile); 
router.post("/verify-email", CustomerController.checkEmailExists);
router.patch("/reset-password", CustomerController.updatePassword);
router.post('/send-otp', verificationOtpController.sendOTP);
router.post('/verify-otp', verificationOtpController.verifyOTP);
router.post('/send-sms',smsController.sendSMS );

// get referral's details of user
router.get("/referrals", authenticateCustomer, CustomerController.getReferrals);

// Customer connect request API
router.route("/connect").post(CustomerController.connectUser);

export default router; 
