import { Router } from "express";
import { BookingController } from "../controllers/bookings.controller";
import { BookAgainAvailabilityService, AmendBookingService } from "../services";
import { PromoCodeService } from "../../../property_management/src/service";
import {
  getBookingDetailsForExtranet,
  getBookingDetailsOfUser,
  createReservationWithStoredCard,
  cancelThirdPartyReservation,
  getAllHotelsByRole
} from "../controllers/bookings.controller";

const amendBookingService = AmendBookingService.getInstance();
const bookAgainService = BookAgainAvailabilityService.getInstance();
const promoCodeService = PromoCodeService.getInstance();
const bookingController = new BookingController(amendBookingService, bookAgainService, promoCodeService);


import { authenticateCustomer } from "../../../customer_authentication/src/middleware/authMiddleware";
import { protect } from "../../../user_authentication/src/Middleware/auth.middleware";

const router = Router();
router.route("/customers/booking/details/:id").get(getBookingDetailsOfUser);
// router.route("/create-reservation-with-card").post(authenticateCustomer as any, createReservationWithStoredCard);

router.route("/update-reservation/:id").patch(authenticateCustomer as any, bookingController.updatePayAtHotelBookings.bind(bookingController));
router.route("/cancel-reservation/:id").patch(authenticateCustomer as any, cancelThirdPartyReservation);



router.route("/count/:id").get(protect as any, getBookingDetailsForExtranet);  
router.route("/customers/booking/details/:id").get(authenticateCustomer as any, getBookingDetailsOfUser);
router.route("/hotelname").get(protect as any, getAllHotelsByRole);


// API for book again room availability check
router.route("/check/availability").get(authenticateCustomer as any, bookingController.bookAgainCheckAvailability.bind(bookingController));


// Reservation API
router.route("/create-reservation-with-card").post(authenticateCustomer as any, bookingController.reservationWithPayAtHotel.bind(bookingController));


export default router;