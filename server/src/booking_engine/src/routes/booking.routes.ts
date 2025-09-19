// import {protect }  from "../../../Customer-Authentication/src/middleware/authMiddleware";
import { Router } from "express";
import {
  // createReservation,
  // getAllReservations,
  // getReservation,
  // updateReservation,
  // getAllReservationsOfUser,
  // getReservationByRoom,
  // deleteReservation,
  // getBookingsForDashboard,
  // updateStatusOfBooking,
  // getRevenueByOwner,
  // getRevenueByProperty,
  getBookingDetailsForExtranet,
  getBookingDetailsOfUser,
  createReservationWithStoredCard,
  cancelThirdPartyReservation,
  getAllHotelsByRole
} from "../controllers/bookings.controller";
import { BookingController } from "../controllers/bookings.controller";
import { BookAgainAvailabilityService, BookingService } from "../services";

const bookingService = BookingService.getInstance();
const bookAgainService = BookAgainAvailabilityService.getInstance();
const bookingController = new BookingController(bookingService, bookAgainService);


import { authenticateCustomer } from "../../../customer_authentication/src/middleware/authMiddleware";
import { protect } from "../../../user_authentication/src/Middleware/auth.middleware";

const router = Router();
router.route("/customers/booking/details/:id").get(getBookingDetailsOfUser);
router.route("/create-reservation-with-card").post(authenticateCustomer as any, createReservationWithStoredCard);

router.route("/update-reservation/:id").patch(authenticateCustomer as any, bookingController.updatePayAtHotelBookings.bind(bookingController));9
router.route("/cancel-reservation/:id").patch(authenticateCustomer as any, cancelThirdPartyReservation);



router.route("/count/:id").get(protect as any, getBookingDetailsForExtranet);  
router.route("/customers/booking/details/:id").get(authenticateCustomer as any, getBookingDetailsOfUser);
router.route("/hotelname").get(protect as any, getAllHotelsByRole);


export default router;