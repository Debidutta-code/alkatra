"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import {protect }  from "../../../Customer-Authentication/src/middleware/authMiddleware";
const express_1 = require("express");
const bookings_controller_1 = require("../controllers/bookings.controller");
const authMiddleware_1 = require("../../../customer_authentication/src/middleware/authMiddleware");
const auth_middleware_1 = require("../../../user_authentication/src/Middleware/auth.middleware");
const router = (0, express_1.Router)();
router.route("/customers/booking/details/:id").get(bookings_controller_1.getBookingDetailsOfUser);
router.route("/create-reservation-with-card").post(authMiddleware_1.authenticateCustomer, bookings_controller_1.createReservationWithStoredCard);
router.route("/update-reservation/:id").patch(authMiddleware_1.authenticateCustomer, bookings_controller_1.updateThirdPartyReservation);
router.route("/cancel-reservation/:id").patch(authMiddleware_1.authenticateCustomer, bookings_controller_1.cancelThirdPartyReservation);
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
router.route("/count/:id").get(auth_middleware_1.protect, bookings_controller_1.getBookingDetailsForExtranet);
// router.route("/owner/revenue/:id").get(authenticateCustomer as any, getRevenueByOwner);
// router.route("/property/revenue/:id").get(authenticateCustomer as any, getRevenueByProperty);
router.route("/customers/booking/details/:id").get(authMiddleware_1.authenticateCustomer, bookings_controller_1.getBookingDetailsOfUser);
router.route("/hotelname").get(auth_middleware_1.protect, bookings_controller_1.getAllHotelsByRole);
exports.default = router;
//# sourceMappingURL=booking.routes.js.map