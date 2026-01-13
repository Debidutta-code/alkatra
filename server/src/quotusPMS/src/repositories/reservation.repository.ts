import { QuotusPMSReservation, QuotusPMSReservationDocument } from '../models/reservation.model';
import { IQuotusPMSReservation } from '../interfaces/reservation.interface';
import { PropertyInfo } from '../../../property_management/src/model';

export class QuotusPMSReservationRepository {
  /**
   * Create a new reservation record
   */
  async createReservation(
    propertyId: string,
    reservationId: string,
    reservationData: IQuotusPMSReservation,
    requestPayload: string,
    responsePayload: string,
    status: 'pending' | 'confirmed' | 'failed' = 'pending'
  ): Promise<QuotusPMSReservationDocument> {
    try {
      const reservation = new QuotusPMSReservation({
        propertyId,
        reservationId,
        reservationData,
        requestPayload,
        responsePayload,
        status,
      });

      return await reservation.save();
    } catch (error: any) {
      console.error('Error creating QuotusPMS reservation:', error);
      throw new Error(`Failed to create reservation: ${error.message}`);
    }
  }

  /**
   * Find reservation by ID
   */
  async findByReservationId(reservationId: string): Promise<QuotusPMSReservationDocument | null> {
    try {
      return await QuotusPMSReservation.findOne({ reservationId });
    } catch (error: any) {
      console.error('Error finding reservation:', error);
      throw new Error(`Failed to find reservation: ${error.message}`);
    }
  }

  /**
   * Find reservations by property ID
   */
  async findByPropertyId(propertyId: string): Promise<QuotusPMSReservationDocument[]> {
    try {
      return await QuotusPMSReservation.find({ propertyId }).sort({ createdAt: -1 });
    } catch (error: any) {
      console.error('Error finding reservations by property:', error);
      throw new Error(`Failed to find reservations: ${error.message}`);
    }
  }

  /**
   * Update reservation status
   */
  async updateStatus(
    reservationId: string,
    status: 'pending' | 'confirmed' | 'failed',
    responsePayload?: string
  ): Promise<QuotusPMSReservationDocument | null> {
    try {
      const updateData: any = { status };
      if (responsePayload) {
        updateData.responsePayload = responsePayload;
      }

      return await QuotusPMSReservation.findOneAndUpdate(
        { reservationId },
        updateData,
        { new: true }
      );
    } catch (error: any) {
      console.error('Error updating reservation status:', error);
      throw new Error(`Failed to update reservation: ${error.message}`);
    }
  }

  async getPropertyCode(
    propertyId: string
  ): Promise<string | null> {
    try {
      const propertyInfo = await PropertyInfo.findOne({ property_code: propertyId });
      return propertyInfo ? propertyInfo.property_code.toString() : null;
    } catch (error: any) {
      console.error('Error getting property code for reservation:', error);
      throw new Error(`Failed to get property code: ${error.message}`);
    }
  }
}
