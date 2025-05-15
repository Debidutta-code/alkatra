import { Router } from "express";
import { authenticateCustomer } from "../../middleware/authMiddleware";
import CustomerController from "../../controllers/customerController";

const router = Router();

router.post("/register", CustomerController.registerCustomer);
router.post("/login", CustomerController.loginCustomer);
router.get("/all", authenticateCustomer, CustomerController.getAllCustomers);
router.get("/me", authenticateCustomer, CustomerController.getCustomerOwnData);
router.patch("/update", authenticateCustomer, authenticateCustomer, CustomerController.updateCustomerProfile); 
router.get("/verify-email", CustomerController.checkEmailExists);
router.patch("/reset-password", CustomerController.updatePassword);

export default router; 
