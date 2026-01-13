import { Request, Response } from 'express';
import { QuotusPMSReservationService } from '../services/reservation.service';
import { IReservationInput } from '../interfaces/reservation.interface';

export class QuotusPMSReservationController {
  private service: QuotusPMSReservationService;

  constructor() {
    this.service = new QuotusPMSReservationService();
  }

  /**
   * Handle reservation creation request
   */
  async handleReservation(req: Request, res: Response): Promise<void> {
    try {
      const reservationInput: IReservationInput = req.body;

      console.log('##################');
      console.log('QuotusPMS Controller - Received reservation request');
      console.log('Request body:', JSON.stringify(reservationInput, null, 2));

      // Validate required fields
      if (!reservationInput.propertyId) {
        res.status(400).json({ 
          error: 'Property ID is required',
          success: false 
        });
        return;
      }

      if (!reservationInput.bookingDetails?.reservationId) {
        res.status(400).json({ 
          error: 'Reservation ID is required',
          success: false 
        });
        return;
      }

      if (!reservationInput.guests || reservationInput.guests.length === 0) {
        res.status(400).json({ 
          error: 'At least one guest is required.........',
          success: false 
        });
        return;
      }

      if (!reservationInput.rooms || reservationInput.rooms.length === 0) {
        res.status(400).json({ 
          error: 'At least one room is required',
          success: false 
        });
        return;
      }

      // Validate dates
      const checkInDate = new Date(reservationInput.bookingDetails.checkInDate);
      const checkOutDate = new Date(reservationInput.bookingDetails.checkOutDate);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      if (checkInDate < currentDate) {
        res.status(400).json({ 
          error: 'Check-in date cannot be in the past',
          success: false 
        });
        return;
      }

      if (checkOutDate <= checkInDate) {
        res.status(400).json({ 
          error: 'Check-out date must be after check-in date',
          success: false 
        });
        return;
      }

      // Process reservation
      console.log('Processing reservation in controller:', reservationInput);
      const reservationId = await this.service.processReservation(reservationInput);

      res.status(201).json({
        success: true,
        message: 'Reservation processed successfully',
        data: {
          reservationId,
        },
      });
    } catch (error: any) {
      console.error('QuotusPMS Controller Error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to process reservation',
      });
    }
  }

  /**
   * Get reservation by ID
   */
  async getReservation(req: Request, res: Response): Promise<void> {
    try {
      const { reservationId } = req.params;

      if (!reservationId) {
        res.status(400).json({ 
          error: 'Reservation ID is required',
          success: false 
        });
        return;
      }

      const reservation = await this.service.getReservation(reservationId);

      if (!reservation) {
        res.status(404).json({
          success: false,
          error: 'Reservation not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: reservation,
      });
    } catch (error: any) {
      console.error('Error getting reservation:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get reservation',
      });
    }
  }

  /**
   * Get reservations by property ID
   */
  async getPropertyReservations(req: Request, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;

      if (!propertyId) {
        res.status(400).json({ 
          error: 'Property ID is required',
          success: false 
        });
        return;
      }

      const reservations = await this.service.getPropertyReservations(propertyId);

      res.status(200).json({
        success: true,
        data: reservations,
      });
    } catch (error: any) {
      console.error('Error getting property reservations:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get reservations',
      });
    }
  }
}
