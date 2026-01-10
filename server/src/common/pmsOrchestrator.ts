import { PropertyInfo } from '../property_management/src/model/property.info.model';
import { DataSourceProvider } from '../property_management/src/model/dataSourceProvider.model';
import { ThirdPartyReservationService } from '../wincloud/src/service/reservationService';
import { QuotusPMSReservationService } from '../quotusPMS/src/services/reservation.service';

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

      if (!property.dataSource) {
        throw new Error(`Property ${propertyId} does not have a data source configured`);
      }

      const dataSource = property.dataSource as any;
      console.log('Property data source:', dataSource.name, '- Type:', dataSource.type);

      // Step 2: Route to appropriate PMS based on data source
      if (dataSource.type === 'Internal') {
        console.log('Property uses Internal system - no external PMS integration needed');
        // Handle internal reservation processing
        // For now, just log and return
        return `INTERNAL-${reservationData.reservationId || Date.now()}`;
      }

      if (dataSource.name === 'Wincloud') {
        console.log('Routing to Wincloud PMS (XML-based)');
        const wincloudService = new ThirdPartyReservationService();
        return await wincloudService.processThirdPartyReservation(reservationData);
      }

      if (dataSource.name === 'QuotusPMS') {
        console.log('Routing to QuotusPMS (JSON-based)');
        const quotusPMSService = new QuotusPMSReservationService(dataSource.apiEndpoint);
        
        // Transform data if needed for QuotusPMS format
        const quotusReservationInput = {
          propertyId,
          bookingDetails: reservationData.bookingDetails,
          guests: reservationData.guests || [],
          rooms: reservationData.rooms || reservationData.roomAssociations || [],
          payment: reservationData.payment,
          additionalNotes: reservationData.additionalNotes,
        };

        return await quotusPMSService.processReservation(quotusReservationInput);
      }

      // If PMS type is not recognized
      throw new Error(`Unsupported PMS type: ${dataSource.name}`);
    } catch (error: any) {
      console.error('PMSOrchestrator Error:', error);
      throw new Error(`Failed to process reservation: ${error.message}`);
    }
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
}
