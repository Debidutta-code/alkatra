import { Router } from 'express';
import { QuotusPMSReservationController } from '../controllers/reservation.controller';
import { ARIController } from '../controllers/ari.controller';

const router = Router();
const reservationController = new QuotusPMSReservationController();
const ariController = new ARIController();

// ========================================
// Reservation Routes
// ========================================

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

// ========================================
// ARI (Availability, Rates, Inventory) Routes
// ========================================

// Fetch initial data from QuotusPMS Partner API
router.post(
  '/fetch-initial-data',
  ariController.fetchInitialData.bind(ariController)
);

// Webhook endpoint for QuotusPMS to push ARI data
router.post(
  '/ari',
  ariController.handleARIUpdate.bind(ariController)
);

// Get ARI data for a property (debugging/testing)
router.get(
  '/ari/:propertyCode',
  ariController.getPropertyARIData.bind(ariController)
);

export default router;
