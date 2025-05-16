import { Router } from "express";
import {
  createReservation,
  getAllReservations,
  getReservation,
  updateReservation,
  getAllReservationsOfUser,
  getReservationByRoom,
  deleteReservation,
  getBookingsForDashboard,
  updateStatusOfBooking,
  countBookings,
  getRevenueByOwner,
  getRevenueByProperty,
  getBookingDetailsOfUser,
  // New controllers for Pay at Hotel feature
  createSetupIntent,
  createReservationWithStoredCard
} from "../controllers/bookings.controller";

import { protect } from "../../../User-Authentication/src/Middleware/auth.middleware";

const router = Router();

// Existing routes
router.route("/createreservation").post(protect as any, createReservation);
router.route("/updatereservation/:id").patch(protect as any, updateReservation);
router.route("/update/:id").patch(protect as any, updateStatusOfBooking);
router.route("/getreservation/:reservationId").get(getReservation);
router.route("/getreservations").get(getAllReservations);
router.route("/getUserReservations/:id").get(getAllReservationsOfUser);

router.route("/:id")
  .get(protect as any, getBookingsForDashboard)
  .delete(protect as any, deleteReservation);
  
router.route("/room/:id").get(protect as any, getReservationByRoom);

router.route("/count/:id").get(protect as any, countBookings);  
router.route("/owner/revenue/:id").get(protect as any, getRevenueByOwner);
router.route("/property/revenue/:id").get(protect as any, getRevenueByProperty);
router.route("/user/booking/details/:id").get(protect as any, getBookingDetailsOfUser);

export default router;