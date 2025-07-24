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
  // countBookings,
  // getRevenueByOwner,
  // getRevenueByProperty,
  getBookingDetailsOfUser,
  createReservationWithStoredCard,
  cancelThirdPartyReservation,
  updateThirdPartyReservation
} from "../controllers/bookings.controller";


import { authenticateCustomer } from "../../../Customer_Authentication/src/middleware/authMiddleware";

const router = Router();
router.route("/customers/booking/details/:id").get(getBookingDetailsOfUser);
router.route("/create-reservation-with-card").post(authenticateCustomer as any, createReservationWithStoredCard);
router.route("/update-reservation/:id").patch(authenticateCustomer as any, updateThirdPartyReservation);
router.route("/cancel-reservation/:id").patch(authenticateCustomer as any, cancelThirdPartyReservation);

// Existing routes
// router.route("/createreservation").post(authenticateCustomer as any, createReservation);
// router.route("/updatereservation/:id").patch(authenticateCustomer as any, updateReservation);
// router.route("/update/:id").patch(authenticateCustomer as any, updateStatusOfBooking);
// router.route("/getreservation/:reservationId").get(getReservation);
// router.route("/getreservations").get(getAllReservations);
// router.route("/getUserReservations/:id").get(getAllReservationsOfUser);
// router.route("/:id")
//   .get( getBookingsForDashboard)
//   .delete(authenticateCustomer as any, deleteReservation);
  
// router.route("/room/:id").get(authenticateCustomer as any, getReservationByRoom);

// router.route("/count/:id").get(authenticateCustomer as any, countBookings);  
// router.route("/owner/revenue/:id").get(authenticateCustomer as any, getRevenueByOwner);
// router.route("/property/revenue/:id").get(authenticateCustomer as any, getRevenueByProperty);
// router.route("/customers/booking/details/:id").get(authenticateCustomer as any, getBookingDetailsOfUser);


export default router;