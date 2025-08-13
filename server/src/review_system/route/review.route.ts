import express from 'express';
import { authenticateCustomer } from "../../customer_authentication/src/middleware/authMiddleware";
import { CustomerReviewController, ReservationController } from "../controller";

const router = express.Router();

const CustomerReviewControllers = new CustomerReviewController();
const reservationController = new ReservationController();

router.route('/create').post(CustomerReviewControllers.createCustomerReview as any);
router.route('/get').get(authenticateCustomer as any, CustomerReviewControllers.getCustomerReview as any);
router.route("/update/:reviewId").patch(authenticateCustomer as any, CustomerReviewControllers.updateReview as any);
router.route("/delete/:reviewId").patch(authenticateCustomer as any, CustomerReviewControllers.deleteReview as any);

router.route("/get/reservation").get(reservationController.getReservationData as any);

export default router;