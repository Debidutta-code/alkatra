import { PropertyInfo } from '../property_management/src/model/property.info.model';
import { DataSourceProvider } from '../property_management/src/model/dataSourceProvider.model';
import { ThirdPartyReservationService } from '../wincloud/src/service/reservationService';
import { QuotusPMSReservationService } from '../quotusPMS/src/services/reservation.service';
import { config } from '../config/env.variable';
import { ReservationProcessor } from '../wincloud/src/processors/reservationProcessor';
import { ThirdPartyReservationRepository } from '../wincloud/src/repository/reservationRepository';

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
        console.log('Property uses Internal system - processing internal reservation');
        return await this.processInternalReservation(reservationData);
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

  /**
 * Process internal reservations - stores in ThirdPartyBooking database without external API calls
 */
  private static async processInternalReservation(data: any): Promise<string> {
    try {
      console.log('Processing internal reservation - storing in database');

      // Step 1: Process the reservation data using the same processor as Wincloud
      const processor = new ReservationProcessor();
      const reservationData = await processor.processReservationInput(data);

      console.log('Processed internal reservation data:', reservationData);

      // Step 2: Save to ThirdPartyBooking database
      const repository = new ThirdPartyReservationRepository();

      // For internal reservations, we don't have XML or external API response
      // So we create a JSON representation and mark it as internal
      const jsonRepresentation = JSON.stringify(reservationData, null, 2);
      const internalResponse = JSON.stringify({
        status: 'Confirmed',
        message: 'Internal reservation processed successfully',
        timestamp: new Date().toISOString(),
        source: 'Internal'
      }, null, 2);

      // Save the booking and create log
      await repository.createThirdPartyBooking(
        reservationData,
        jsonRepresentation, // Instead of XML, we pass JSON
        internalResponse    // Instead of API response, we pass internal confirmation
      );

      console.log('Internal reservation saved successfully with ID:', reservationData.reservationId);
      return reservationData.reservationId;

    } catch (error: any) {
      console.error('Error processing internal reservation:', error);
      throw new Error(`Failed to process internal reservation: ${error.message}`);
    }
  }

  /**
   * Process amendment/update of reservations by routing to appropriate PMS
   */
  static async processAmendReservation(propertyId: string, amendReservationData: any): Promise<string> {
    try {
      console.log('PMSOrchestrator: Processing amendment for property:', amendReservationData);

      // Step 1: Get property information
      const property = await PropertyInfo.findById(propertyId).populate('dataSource');

      if (!property) {
        throw new Error(`Property not found: ${propertyId}`);
      }

      // Step 2: Handle properties without data source (backward compatibility)
      if (!property.dataSource) {
        console.log('⚠️ Property does not have a data source configured. Using default behavior (Wincloud).');
        const { ThirdPartyAmendReservationService } = await import('../wincloud/src/service/amendReservationService');
        const wincloudAmendService = new ThirdPartyAmendReservationService();
        return await wincloudAmendService.processAmendReservation(amendReservationData);
      }

      const dataSource = property.dataSource as any;
      console.log('Property data source for amend:', dataSource.name, '- Type:', dataSource.type);

      // Step 3: Route to appropriate PMS based on data source
      if (dataSource.type === 'Internal') {
        console.log('Property uses Internal system - processing internal amendment');
        return await this.processInternalAmendment(amendReservationData);
      }

            // For external PMS (Wincloud, QuotusPMS, etc.), use their amend services
      if (dataSource.type === 'PMS' || dataSource.name === 'Wincloud' || dataSource.name === 'QuotusPMS') {
        if (dataSource.name === 'Wincloud') {
          console.log('Routing amend to Wincloud PMS');
          const { ThirdPartyAmendReservationService } = await import('../wincloud/src/service/amendReservationService');
          const wincloudAmendService = new ThirdPartyAmendReservationService();
          return await wincloudAmendService.processAmendReservation(amendReservationData);
        }

        if (dataSource.name === 'QuotusPMS') {
          console.log('Routing amend to QuotusPMS');
          
          // Get API endpoint and token from data source or config
          const apiEndpoint = dataSource.apiEndpoint || config.pmsIntegration?.quotusPmsApiUrl;
          const accessToken = config.pmsIntegration?.quotusPmsToken;

          if (!apiEndpoint) {
            throw new Error('QuotusPMS API endpoint not configured');
          }

          if (!accessToken) {
            console.warn('⚠️ QuotusPMS access token not configured');
          }

          const { QuotusPMSAmendService } = await import('../quotusPMS/src/services/amend.service');
          const quotusPMSAmendService = new QuotusPMSAmendService(apiEndpoint, accessToken);
          
          return await quotusPMSAmendService.processAmendReservation(propertyId, amendReservationData);
        }
      }

      throw new Error(`Amendment not yet supported for PMS type: ${dataSource.name}`);
    } catch (error: any) {
      console.error('PMSOrchestrator Amend Error:', error);
      throw new Error(`Failed to process amendment: ${error.message}`);
    }
  }

  /**
   * Process internal reservation amendments - updates in ThirdPartyBooking database without external API calls
   */
  private static async processInternalAmendment(data: any): Promise<string> {
    try {
      console.log('Processing internal amendment - updating database');

      const { ThirdPartyBooking } = await import('../wincloud/src/model/reservationModel');
      const { prepareAmendReservationData } = await import('../wincloud/src/processors/amendReservationProcessor');
      const { ThirdPartyAmendReservationRepository } = await import('../wincloud/src/repository/amendReservationRepository');

      // Step 1: Check if reservation exists
      const reservation = await ThirdPartyBooking.findOne({ reservationId: data.bookingDetails.reservationId });
      if (!reservation) {
        throw new Error('Reservation not found');
      }

            // Step 2: Validate check-in date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkInDate = new Date(reservation.checkInDate);
      checkInDate.setHours(0, 0, 0, 0);

      if (today >= checkInDate) {
        throw new Error("Can't update reservation. Your check-in date already passed.");
      }

      // Step 3: Prepare amendment data
      const amendReservationData = await prepareAmendReservationData(data);
      console.log('Processed internal amendment data:', amendReservationData);

      // Step 4: Save the amendment
      const repository = new ThirdPartyAmendReservationRepository();

      // For internal amendments, create JSON representation
      const jsonRepresentation = JSON.stringify(amendReservationData, null, 2);
      const internalResponse = JSON.stringify({
        status: 'Confirmed',
        message: 'Internal amendment processed successfully',
        timestamp: new Date().toISOString(),
        source: 'Internal'
      }, null, 2);

      await repository.createAmendReservation(amendReservationData, jsonRepresentation, internalResponse);

      console.log('Internal amendment saved successfully for reservation:', data.bookingDetails.reservationId);
      return data.bookingDetails.reservationId;

    } catch (error: any) {
      console.error('Error processing internal amendment:', error);
      throw new Error(`Failed to process internal amendment: ${error.message}`);
    }
  }

  /**
   * Process cancellation of reservations by routing to appropriate PMS
   */
  static async processCancelReservation(propertyId: string, cancelReservationData: any): Promise<string> {
    try {
      console.log('PMSOrchestrator: Processing cancellation for property:', cancelReservationData);

      // Step 1: Get property information
      const property = await PropertyInfo.findById(propertyId).populate('dataSource');

      if (!property) {
        throw new Error(`Property not found: ${propertyId}`);
      }

      // Step 2: Handle properties without data source (backward compatibility)
      if (!property.dataSource) {
        console.log('⚠️ Property does not have a data source configured. Using default behavior (Wincloud).');
        const { ThirdPartyCancelReservationService } = await import('../wincloud/src/service/cancelReservationService');
        const wincloudCancelService = new ThirdPartyCancelReservationService();
        return await wincloudCancelService.processCancelReservation(cancelReservationData);
      }

      const dataSource = property.dataSource as any;
      console.log('Property data source for cancel:', dataSource.name, '- Type:', dataSource.type);

      // Step 3: Route to appropriate PMS based on data source
      if (dataSource.type === 'Internal') {
        console.log('Property uses Internal system - processing internal cancellation');
        return await this.processInternalCancellation(cancelReservationData);
      }

      // For external PMS (Wincloud, QuotusPMS, etc.), use their cancel services
      if (dataSource.type === 'PMS' || dataSource.name === 'Wincloud' || dataSource.name === 'QuotusPMS') {
        if (dataSource.name === 'Wincloud') {
          console.log('Routing cancel to Wincloud PMS');
          const { ThirdPartyCancelReservationService } = await import('../wincloud/src/service/cancelReservationService');
          const wincloudCancelService = new ThirdPartyCancelReservationService();
          return await wincloudCancelService.processCancelReservation(cancelReservationData);
        }

        if (dataSource.name === 'QuotusPMS') {
          console.log('Routing cancel to QuotusPMS');
          
          // Get API endpoint and token from data source or config
          const apiEndpoint = dataSource.apiEndpoint || config.pmsIntegration?.quotusPmsApiUrl;
          const accessToken = config.pmsIntegration?.quotusPmsToken;

          if (!apiEndpoint) {
            throw new Error('QuotusPMS API endpoint not configured');
          }

          if (!accessToken) {
            console.warn('⚠️ QuotusPMS access token not configured');
          }

          const { QuotusPMSCancelService } = await import('../quotusPMS/src/services/cancel.service');
          const quotusPMSCancelService = new QuotusPMSCancelService(apiEndpoint, accessToken);
          
          return await quotusPMSCancelService.processCancelReservation(propertyId, cancelReservationData);
        }
      }

      throw new Error(`Cancellation not yet supported for PMS type: ${dataSource.name}`);
    } catch (error: any) {
      console.error('PMSOrchestrator Cancel Error:', error);
      throw new Error(`Failed to process cancellation: ${error.message}`);
    }
  }

  /**
   * Process internal reservation cancellations - updates in ThirdPartyBooking database without external API calls
   */
  private static async processInternalCancellation(data: any): Promise<string> {
    try {
      console.log('Processing internal cancellation - updating database');

      const { ThirdPartyBooking } = await import('../wincloud/src/model/reservationModel');
      const { ThirdPartyCancelReservationRepository } = await import('../wincloud/src/repository/cancelReservationRepository');

      // Step 1: Check if reservation exists
      const reservation = await ThirdPartyBooking.findOne({ reservationId: data.reservationId });
      if (!reservation) {
        throw new Error('Reservation not found');
      }

      // Step 2: Validate check-in date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkInDate = new Date(reservation.checkInDate);
      checkInDate.setHours(0, 0, 0, 0);

      if (today >= checkInDate) {
        throw new Error("Can't cancel reservation. Your check-in date already passed.");
      }

      // Step 3: Prepare cancellation data
      const cancelReservationData = {
        reservationId: data.reservationId,
        hotelCode: reservation.hotelCode || data.hotelCode,
        hotelName: reservation.hotelName || data.hotelName,
        firstName: data.firstName || reservation.guestDetails?.[0]?.firstName || '',
        lastName: data.lastName || reservation.guestDetails?.[0]?.lastName || '',
        checkInDate: new Date(reservation.checkInDate).toISOString().split('T')[0],
        checkOutDate: new Date(reservation.checkOutDate).toISOString().split('T')[0],
        status: 'Cancelled'
      };

      console.log('Processed internal cancellation data:', cancelReservationData);

      // Step 4: Save the cancellation
      const repository = new ThirdPartyCancelReservationRepository();

      // For internal cancellations, create JSON representation
      const jsonRepresentation = JSON.stringify(cancelReservationData, null, 2);
      const internalResponse = JSON.stringify({
        status: 'Cancelled',
        message: 'Internal cancellation processed successfully',
        timestamp: new Date().toISOString(),
        source: 'Internal'
      }, null, 2);

      await repository.createCancelReservation(cancelReservationData, jsonRepresentation, internalResponse);

      console.log('Internal cancellation saved successfully for reservation:', data.reservationId);
      return data.reservationId;

    } catch (error: any) {
      console.error('Error processing internal cancellation:', error);
      throw new Error(`Failed to process internal cancellation: ${error.message}`);
    }
  }
}