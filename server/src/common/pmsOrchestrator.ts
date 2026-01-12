import { PropertyInfo } from '../property_management/src/model/property.info.model';
import { DataSourceProvider } from '../property_management/src/model/dataSourceProvider.model';
import { ThirdPartyReservationService } from '../wincloud/src/service/reservationService';
import { QuotusPMSReservationService } from '../quotusPMS/src/services/reservation.service';
import { config } from '../config/env.variable';

/**
 * PMS Orchestrator - Routes reservations to appropriate PMS based on property configuration
 */
export class PMSOrchestrator {
  /**
   * Process reservation by routing to appropriate PMS
   */
  static async processReservation(propertyId: string, reservationData: any): Promise<string> {
    try {
      console.log('PMSOrchestrator: Processing reservation for property:', propertyId);

      // Step 1: Get property information
      const property = await PropertyInfo.findById(propertyId).populate('dataSource');
      
      if (!property) {
        throw new Error(`Property not found: ${propertyId}`);
      }

      // Step 2: Handle properties without data source (backward compatibility)
      if (!property.dataSource) {
        console.log('⚠️ Property does not have a data source configured. Using default behavior (Wincloud).');
        const wincloudService = new ThirdPartyReservationService();
        return await wincloudService.processThirdPartyReservation(reservationData);
      }

      const dataSource = property.dataSource as any;
      console.log('Property data source:', dataSource.name, '- Type:', dataSource.type);

      // Step 3: Route to appropriate PMS based on data source
      if (dataSource.type === 'Internal') {
        console.log('Property uses Internal system - no external PMS integration needed');
        // For internal reservations, just return a local reservation ID
        return `INTERNAL-${reservationData.reservationId || reservationData.bookingDetails?.reservationId || Date.now()}`;
      }

      if (dataSource.type === 'CM') {
        console.log('Property uses Channel Manager - not yet implemented');
        throw new Error('Channel Manager integration is not yet implemented');
      }

      // Handle External PMS integrations
      if (dataSource.type === 'PMS' || dataSource.name === 'Wincloud' || dataSource.name === 'QuotusPMS') {
        if (dataSource.name === 'Wincloud') {
          console.log('Routing to Wincloud PMS (XML-based)');
          const wincloudService = new ThirdPartyReservationService();
          return await wincloudService.processThirdPartyReservation(reservationData);
        }

        if (dataSource.name === 'QuotusPMS') {
          console.log('Routing to QuotusPMS (JSON-based)');
          
          // Get API endpoint and token from data source or config
          const apiEndpoint = dataSource.apiEndpoint || config.pmsIntegration?.quotusPmsApiUrl;
          const accessToken = config.pmsIntegration?.quotusPmsToken;

          if (!apiEndpoint) {
            throw new Error('QuotusPMS API endpoint not configured');
          }

          if (!accessToken) {
            console.warn('⚠️ QuotusPMS access token not configured');
          }

          const quotusPMSService = new QuotusPMSReservationService(apiEndpoint, accessToken);
          
          // Transform data for QuotusPMS format
          const quotusReservationInput = this.transformToQuotusPMSFormat(propertyId, reservationData);

          return await quotusPMSService.processReservation(quotusReservationInput);
        }
      }

      // If PMS type is not recognized
      throw new Error(`Unsupported PMS type: ${dataSource.name} (type: ${dataSource.type})`);
    } catch (error: any) {
      console.error('PMSOrchestrator Error:', error);
      throw new Error(`Failed to process reservation: ${error.message}`);
    }
  }

  /**
   * Transform reservation data to QuotusPMS format
   */
  private static transformToQuotusPMSFormat(propertyId: string, reservationData: any): any {
    const bookingDetails = reservationData.bookingDetails || reservationData;
    
    return {
      propertyId,
      bookingDetails: {
        checkInDate: bookingDetails.checkInDate,
        checkOutDate: bookingDetails.checkOutDate,
        reservationId: bookingDetails.reservationId,
        userId: bookingDetails.userId,
      },
      guests: reservationData.guests || [],
      rooms: reservationData.rooms || reservationData.roomAssociations || [],
      payment: reservationData.payment || {
        totalAmount: bookingDetails.roomTotalPrice || 0,
        paidAmount: bookingDetails.paidAmount || 0,
        discountedAmount: bookingDetails.discountedAmount || 0,
        currencyCode: bookingDetails.currencyCode || 'INR',
        paymentMethod: bookingDetails.paymentMethod || 'none',
        paymentNote: bookingDetails.paymentNote || null,
      },
      additionalNotes: reservationData.additionalNotes || bookingDetails.additionalNotes,
    };
  }

  /**
   * Get property's PMS configuration
   */
  static async getPropertyPMSConfig(propertyId: string) {
    try {
      const property = await PropertyInfo.findById(propertyId).populate('dataSource');
      
      if (!property || !property.dataSource) {
        return null;
      }

      const dataSource = property.dataSource as any;
      return {
        name: dataSource.name,
        type: dataSource.type,
        apiEndpoint: dataSource.apiEndpoint,
        isActive: dataSource.isActive,
      };
    } catch (error: any) {
      console.error('Error getting PMS config:', error);
      return null;
    }
  }

  /**
   * Check if property requires external PMS integration
   */
  static async requiresExternalPMS(propertyId: string): Promise<boolean> {
    try {
      const config = await this.getPropertyPMSConfig(propertyId);
      return config ? config.type === 'PMS' && config.isActive : false;
    } catch (error: any) {
      console.error('Error checking PMS requirement:', error);
      return false;
    }
  }
}
