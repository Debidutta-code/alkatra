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
      console.log('PMSOrchestrator: Processing reservation for property:', reservationData);

      console.log("property id is ************ ", propertyId);

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
          const apiEndpoint = config.pmsIntegration?.quotusPmsApiUrl;
          const accessToken = config.pmsIntegration?.quotusPmsToken;

          if (!apiEndpoint) {
            throw new Error('QuotusPMS API endpoint not configured');
          }

          if (!accessToken) {
            console.warn('⚠️ QuotusPMS access token not configured');
          }

          const quotusPMSService = new QuotusPMSReservationService(apiEndpoint, accessToken);

          // Transform data for QuotusPMS format
          console.log('Transforming data for QuotusPMS format...', reservationData);
          const quotusReservationInput = this.transformToQuotusPMSFormat(propertyId, reservationData);
          console.log('QuotusPMS reservation input: 74', quotusReservationInput);
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

  private static transformToQuotusPMSFormat(propertyId: string, reservationData: any): any {
    console.log('🔍 Raw reservationData received:', JSON.stringify(reservationData, null, 2));
    console.log('🔑 PropertyId received in transformer:', propertyId); // Added debug log

    // Check if data is in bookingDetails structure (from existing system)
    const bookingDetails = reservationData.bookingDetails || {};
    const isNestedStructure = !!reservationData.bookingDetails;

    // Extract guests - from bookingDetails.guests or top-level Guests
    const guestsArray = isNestedStructure
      ? (bookingDetails.guests || [])
      : (reservationData.Guests || reservationData.guests || []);

    // Get email and phone from bookingDetails or first adult guest
    const primaryEmail = isNestedStructure
      ? bookingDetails.email
      : guestsArray.find((g: any) => g.userType === 'adult')?.email || '';

    const primaryPhone = isNestedStructure
      ? bookingDetails.phone
      : guestsArray.find((g: any) => g.userType === 'adult')?.phoneNumber || '';

    console.log('👥 Extracted guests:', guestsArray.length);

    // Transform to output format - START WITH PROPERTY ID
    const result: any = {
      propertyId: propertyId  // ✅ CRITICAL: Add propertyId first
    };

    // Extract dates
    if (isNestedStructure) {
      if (bookingDetails.checkInDate) result.from = new Date(bookingDetails.checkInDate).toISOString();
      if (bookingDetails.checkOutDate) result.to = new Date(bookingDetails.checkOutDate).toISOString();
    } else {
      if (reservationData.from) result.from = reservationData.from;
      if (reservationData.to) result.to = reservationData.to;
    }

    if (reservationData.bookedAt) result.bookedAt = reservationData.bookedAt;

    // Payment info
    const totalAmount = isNestedStructure
      ? bookingDetails.roomTotalPrice
      : reservationData.totalAmount;

    const paidAmount = isNestedStructure
      ? bookingDetails.paidAmount
      : reservationData.paidAmount;

    const discountedAmount = isNestedStructure
      ? bookingDetails.discountedAmount
      : reservationData.discountedAmount;

    if (totalAmount !== undefined) result.totalAmount = totalAmount;
    if (paidAmount !== undefined) result.paidAmount = paidAmount;
    if (discountedAmount !== undefined) result.discountedAmount = discountedAmount;

    const paymentNote = isNestedStructure
      ? bookingDetails.paymentNote
      : reservationData.paymentNote;
    if (paymentNote) result.paymentNote = paymentNote;

    const currencyCode = isNestedStructure
      ? bookingDetails.currencyCode
      : reservationData.currencyCode;
    if (currencyCode) result.currencyCode = currencyCode;

    const paymentMethod = isNestedStructure
      ? bookingDetails.paymentMethod
      : reservationData.paymentMethod;
    if (paymentMethod) result.paymentMethod = paymentMethod;

    // Map guests with email for each
    result.Guests = guestsArray.map((guest: any) => {
      const mappedGuest: any = {};
      if (guest.firstName) mappedGuest.firstName = guest.firstName;
      if (guest.lastName) mappedGuest.lastName = guest.lastName;

      // Use individual guest email if exists, otherwise use primary email
      mappedGuest.email = guest.email || primaryEmail;

      if (guest.phoneNumber) mappedGuest.phoneNumber = guest.phoneNumber;
      if (guest.userType || guest.type) mappedGuest.userType = guest.userType || guest.type;
      if (guest.country) mappedGuest.country = guest.country;
      if (guest.address) mappedGuest.address = guest.address;
      if (guest.city) mappedGuest.city = guest.city;
      if (guest.state) mappedGuest.state = guest.state;
      if (guest.zipCode) mappedGuest.zipCode = guest.zipCode;
      if (guest.identityCardType) mappedGuest.identityCardType = guest.identityCardType;
      if (guest.identityCardNumber) mappedGuest.identityCardNumber = guest.identityCardNumber;
      return mappedGuest;
    });

    // Map rooms
    if (isNestedStructure) {
      // Build room from bookingDetails
      const room: any = {};
      if (bookingDetails.roomTypeCode) room.roomCode = bookingDetails.roomTypeCode;
      if (bookingDetails.ratePlanCode) room.ratePlanCode = bookingDetails.ratePlanCode;
      if (bookingDetails.numberOfRooms !== undefined) room.noOfRooms = bookingDetails.numberOfRooms;

      // Calculate occupancy from ageCodeSummary if available
      const ageCodeSummary = reservationData.ageCodeSummary || {};
      if (ageCodeSummary['10'] !== undefined) room.noOfAdults = ageCodeSummary['10'];
      if (ageCodeSummary['8'] !== undefined) room.noOfChildren = ageCodeSummary['8'];
      if (ageCodeSummary['7'] !== undefined) room.noOfInfants = ageCodeSummary['7'];

      result.Rooms = [room];
    } else {
      // Use existing Rooms array
      const roomsArray = reservationData.Rooms || reservationData.rooms || [];
      result.Rooms = roomsArray.map((room: any) => {
        const mappedRoom: any = {};
        if (room.roomCode) mappedRoom.roomCode = room.roomCode;
        if (room.roomName) mappedRoom.roomName = room.roomName;
        if (room.ratePlanCode) mappedRoom.ratePlanCode = room.ratePlanCode;
        if (room.ratePlanName) mappedRoom.ratePlanName = room.ratePlanName;
        if (room.noOfRooms !== undefined) mappedRoom.noOfRooms = room.noOfRooms;
        if (room.noOfAdults !== undefined) mappedRoom.noOfAdults = room.noOfAdults;
        if (room.noOfChildren !== undefined) mappedRoom.noOfChildren = room.noOfChildren;
        if (room.noOfInfants !== undefined) mappedRoom.noOfInfants = room.noOfInfants;
        return mappedRoom;
      });
    }

    const additionalNotes = isNestedStructure
      ? bookingDetails.additionalNotes
      : reservationData.additionalNotes;
    if (additionalNotes) result.additionalNotes = additionalNotes;

    console.log('✅ Transformed result:', JSON.stringify(result, null, 2));
    console.log('🔑 Verify propertyId in result:', result.propertyId); // Added debug log
    return result;
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
