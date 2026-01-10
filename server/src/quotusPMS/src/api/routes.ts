import { Router } from 'express';
import { QuotusPMSReservationController } from '../controllers/reservation.controller';

const router = Router();
const reservationController = new QuotusPMSReservationController();

// Create reservation
router.post(
  '/reservations',
  reservationController.handleReservation.bind(reservationController)
);

// Get reservation by ID
router.get(
  '/reservations/:reservationId',
  reservationController.getReservation.bind(reservationController)
);

// Get reservations by property ID
router.get(
  '/properties/:propertyId/reservations',
  reservationController.getPropertyReservations.bind(reservationController)
);

export default router;
