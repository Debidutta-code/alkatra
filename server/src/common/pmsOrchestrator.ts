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

      console.log("propertyid in pms orchestrator:", propertyId);
      
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
    
    // Build the output in the format expected by QuotusPMS service
    const transformedBookingDetails: any = {
      provider: 'web',
      coupon: [],
      taxValue: 0
    };
    
    // Extract and transform dates
    if (isNestedStructure) {
      if (bookingDetails.checkInDate) transformedBookingDetails.checkInDate = bookingDetails.checkInDate;
      if (bookingDetails.checkOutDate) transformedBookingDetails.checkOutDate = bookingDetails.checkOutDate;
      // Generate reservationId if empty or not provided
      transformedBookingDetails.reservationId = bookingDetails.reservationId && bookingDetails.reservationId.trim() !== '' 
        ? bookingDetails.reservationId 
        : `RES-${Date.now()}`;
      if (bookingDetails.userId) transformedBookingDetails.userId = bookingDetails.userId;
      if (bookingDetails.paymentMethod) transformedBookingDetails.paymentMethod = bookingDetails.paymentMethod;
    } else {
      if (reservationData.from) transformedBookingDetails.checkInDate = new Date(reservationData.from).toISOString().split('T')[0];
      if (reservationData.to) transformedBookingDetails.checkOutDate = new Date(reservationData.to).toISOString().split('T')[0];
      // Generate reservationId if empty or not provided
      transformedBookingDetails.reservationId = reservationData.reservationId && reservationData.reservationId.trim() !== '' 
        ? reservationData.reservationId 
        : `RES-${Date.now()}`;
      if (reservationData.userId) transformedBookingDetails.userId = reservationData.userId;
      if (reservationData.paymentMethod) transformedBookingDetails.paymentMethod = reservationData.paymentMethod;
    }
    
    transformedBookingDetails.hotelCode = propertyId;
    
    if (isNestedStructure) {
      if (bookingDetails.hotelName) transformedBookingDetails.hotelName = bookingDetails.hotelName;
      if (bookingDetails.ratePlanCode) transformedBookingDetails.ratePlanCode = bookingDetails.ratePlanCode;
      if (bookingDetails.roomTypeCode) transformedBookingDetails.roomTypeCode = bookingDetails.roomTypeCode;
      if (bookingDetails.numberOfRooms) transformedBookingDetails.numberOfRooms = bookingDetails.numberOfRooms;
      if (bookingDetails.roomTotalPrice !== undefined) transformedBookingDetails.roomTotalPrice = bookingDetails.roomTotalPrice;
      if (bookingDetails.paidAmount !== undefined) transformedBookingDetails.paidAmount = bookingDetails.paidAmount;
      if (bookingDetails.discountedAmount !== undefined) transformedBookingDetails.discountedAmount = bookingDetails.discountedAmount;
      if (bookingDetails.currencyCode) transformedBookingDetails.currencyCode = bookingDetails.currencyCode;
      if (bookingDetails.paymentNote) transformedBookingDetails.paymentNote = bookingDetails.paymentNote;
    } else {
      // Extract from flat structure
      const rooms = reservationData.Rooms || reservationData.rooms || [];
      const primaryRoom = rooms[0] || {};
      
      if (reservationData.hotelName) transformedBookingDetails.hotelName = reservationData.hotelName;
      if (primaryRoom.ratePlanCode) transformedBookingDetails.ratePlanCode = primaryRoom.ratePlanCode;
      if (primaryRoom.roomCode) transformedBookingDetails.roomTypeCode = primaryRoom.roomCode;
      if (primaryRoom.noOfRooms) transformedBookingDetails.numberOfRooms = primaryRoom.noOfRooms;
      if (reservationData.totalAmount !== undefined) transformedBookingDetails.roomTotalPrice = reservationData.totalAmount;
      if (reservationData.paidAmount !== undefined) transformedBookingDetails.paidAmount = reservationData.paidAmount;
      if (reservationData.discountedAmount !== undefined) transformedBookingDetails.discountedAmount = reservationData.discountedAmount;
      if (reservationData.currencyCode) transformedBookingDetails.currencyCode = reservationData.currencyCode;
      if (reservationData.paymentNote) transformedBookingDetails.paymentNote = reservationData.paymentNote;
    }
    
    // Map guests with email for each - ensure it's always an array
    transformedBookingDetails.guests = (guestsArray || []).map((guest: any) => {
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
    
    if (primaryEmail) transformedBookingDetails.email = primaryEmail;
    if (primaryPhone) transformedBookingDetails.phone = primaryPhone;
    
    const additionalNotes = isNestedStructure 
      ? bookingDetails.additionalNotes 
      : reservationData.additionalNotes;
    if (additionalNotes) transformedBookingDetails.additionalNotes = additionalNotes;
    
    // Build rooms array
    let transformedRooms = [];
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
      
      transformedRooms = [room];
    } else {
      // Use existing Rooms array
      const roomsArray = reservationData.Rooms || reservationData.rooms || [];
      transformedRooms = roomsArray.map((room: any) => {
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
    
    // Calculate age code summary
    const ageCodeSummary = isNestedStructure 
      ? reservationData.ageCodeSummary 
      : {
          '7': guestsArray.filter((g: any) => (g.userType || g.type) === 'infant').length,
          '8': guestsArray.filter((g: any) => (g.userType || g.type) === 'child').length,
          '10': guestsArray.filter((g: any) => (g.userType || g.type) === 'adult').length
        };
    
    const result = {
      propertyId,
      bookingDetails: transformedBookingDetails,
      rooms: transformedRooms || [],
      ageCodeSummary
    };
    
    console.log('✅ Transformed result:');
    console.log('  - propertyId:', result.propertyId);
    console.log('  - bookingDetails.guests:', result.bookingDetails.guests?.length || 0);
    console.log('  - rooms:', result.rooms?.length || 0);
    console.log('  - Full result:', JSON.stringify(result, null, 2));
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
