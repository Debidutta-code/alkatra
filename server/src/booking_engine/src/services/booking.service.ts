import { AmendBookingRepository } from "../repository";
import { Inventory } from "../../../wincloud/src/model/inventoryModel";
import { PropertyInfo } from "../../../property_management/src/model/property.info.model";
import Handlebars from "handlebars";
import { MailFactory } from "../../../customer_authentication/src/services/mailFactory";
import { ThirdPartyAmendReservationService } from '../../../wincloud/src/controller/amendReservationController';
import { ThirdPartyReservationService } from "../../../wincloud/src/service/reservationService";
import { PMSOrchestrator } from "../../../common/pmsOrchestrator";

interface AmendReservationInput {
  bookingDetails: {
    userId: string;
    reservationId: string;
    checkInDate: string;
    checkOutDate: string;
    hotelCode: string;
    hotelName: string;
    ratePlanCode: string;
    roomTypeCode: string;
    numberOfRooms: number;
    roomTotalPrice: number;
    currencyCode: string;
    guests: any[];
    email: string;
    phone: string;
  };
  ageCodeSummary: Record<string, number>;
}

interface IGuest {
  firstName: string;
  lastName: string;
  category: string;
}

interface CreateBookingInput {
  userId: string;
  checkInDate: string;
  checkOutDate: string;
  hotelCode: string;
  hotelName: string;
  ratePlanCode: string;
  roomTypeCode: string;
  numberOfRooms: number;
  roomTotalPrice: number;
  currencyCode: string;
  guests: IGuest[];
  email: string;
  phone: string;
  paymentInfo: string;
}


export class AmendBookingService {
  private bookingRepository: AmendBookingRepository;
  private static instance: AmendBookingService;
  private mailer = MailFactory.getMailer();
  private constructor() {
    this.bookingRepository = AmendBookingRepository.getInstance();
  }

  static getInstance(): AmendBookingService {
    if (!AmendBookingService.instance) {
      AmendBookingService.instance = new AmendBookingService();
    }
    return AmendBookingService.instance;
  }

  async getBookings(reservationId: string) {
    try {
      if (!reservationId) {
        throw new Error("No reservation id found to get booking details");
      }

      const bookDetails = await this.bookingRepository.getBookingDetailsByReservationId(reservationId);
      if (!bookDetails) {
        throw new Error("No booking details found");
      }

      return bookDetails;
    } catch (error: any) {
      console.log("Error in getBookings", error);
      throw new Error("Failed to get bookings");
    }
  }

  async checkRequiredField(requiredFields: any) {
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => value === undefined || value === null || value === "")
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return "Missing required fields: " + missingFields.join(", ");
    }
  }

  /**
   * Main service function of Amend Reservation
   */
  async updateBooking(
    userId: string,
    reservationId: string,
    bookingDetails: {
      checkInDate: string;
      checkOutDate: string;
      hotelCode: string;
      hotelName: string;
      ratePlanCode: string;
      numberOfRooms: number;
      roomTypeCode: string;
      roomTotalPrice: number;
      currencyCode: string;
      email: string;
      phone: string;
      guests: { firstName: string; lastName: string; category: string }[];
    }
  ) {
    const requiredFields = { ...bookingDetails, reservationId };
    const missingFieldsError = await this.checkRequiredField(requiredFields);
    if (missingFieldsError) {
      throw new Error(missingFieldsError);
    }

    await this.validateBookingDates(bookingDetails.checkInDate, bookingDetails.checkOutDate);

    const reservationDetails = await this.getBookings(reservationId);
    if (!reservationDetails) {
      throw new Error("No reservation details found");
    }

    const { categorizedGuests, ageCodeSummary } = await this.processGuests(bookingDetails.guests);

    const amendReservationInput: AmendReservationInput = {
      bookingDetails: { ...bookingDetails, userId, reservationId },
      ageCodeSummary,
    };

    const dates = [new Date(bookingDetails.checkInDate), new Date(bookingDetails.checkOutDate)];
    await this.increaseRoomsBeforeBooking(reservationId);

    await this.amendReservationWithThirdParty(amendReservationInput);

    await this.reduceRoomsAfterBookingUpdateConfirmed(
      bookingDetails.hotelCode,
      bookingDetails.roomTypeCode,
      bookingDetails.numberOfRooms,
      dates
    );

    await this.sendBookingConfirmationEmail(bookingDetails.email, bookingDetails.hotelName, {
      ...bookingDetails,
      guests: categorizedGuests,
    });

    return { categorizedGuests, ageCodeSummary };
  }

  /**
   * Helper for Booking Modification
   * Used in : updateBooking
   */
  async validateBookingDates(checkInDate: string, checkOutDate: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (checkIn < today || checkOut <= checkIn) {
      throw new Error("Check-in date cannot be in the past or Check-out date must be after check-in date");
    }
  }

  async processGuests(guests: { firstName: string; lastName: string; category: string }[]): Promise<{
    categorizedGuests: { firstName: string; lastName: string; category: string; ageCode: string }[];
    ageCodeSummary: Record<string, number>;
  }> {
    if (!Array.isArray(guests) || guests.length === 0) {
      throw new Error("Guest details are required");
    }

    const ageCodeCount: Record<string, number> = { "7": 0, "8": 0, "10": 0 };

    const categorizedGuests = await Promise.all(
      guests.map(async ({ firstName, lastName, category }) => {
        if (!category) throw new Error(`Category missing for ${firstName} ${lastName}`);
        const { category: validatedCategory, ageCode } = await this.calculateAgeCategory(category);
        ageCodeCount[ageCode] = (ageCodeCount[ageCode] || 0) + 1;
        return { firstName, lastName, category: validatedCategory, ageCode };
      })
    );

    return { categorizedGuests, ageCodeSummary: ageCodeCount };
  }

  async calculateAgeCategory(category: string) {
    try {
      if (!category) {
        throw new Error("Category is required");
      }

      const ageCodes: Record<string, string> = {
        "adult": "10",
        "child": "8",
        "infant": "7"
      };

      const ageCode = ageCodes[category.toLowerCase()];
      if (!ageCode) {
        throw new Error("Invalid category provided");
      }

      return { category, ageCode };
    } catch (error: any) {
      console.log("Error in calculateAgeCategory", error);
      throw new Error("Failed to calculate age category");
    }
  }

  /**
   * Helper for Booking Modification
   * Used in : updateBooking
   */
  async amendReservationWithThirdParty(amendReservationInput: AmendReservationInput): Promise<void> {
    try {
      // Get property ID from hotel code
      const property = await PropertyInfo.findOne({ property_code: amendReservationInput.bookingDetails.hotelCode });
      
      if (!property) {
        throw new Error(`Property not found with code: ${amendReservationInput.bookingDetails.hotelCode}`);
      }

      const propertyId = property._id.toString();
      console.log(`Property found for amendment: ${property.property_name} (ID: ${propertyId})`);

      // Use PMSOrchestrator to route amendment to appropriate PMS
      await PMSOrchestrator.processAmendReservation(propertyId, amendReservationInput);
      console.log('✅ Amendment successfully processed through PMS Orchestrator');
    } catch (error: any) {
      console.error('❌ Failed to amend reservation:', error.message);
      throw new Error(`Failed to send to third-party API: ${error.message}`);
    }
  }

  /**
   * Helper for Booking Modification
   * Used in : updateBooking 
   */
  async sendBookingConfirmationEmail(
    email: string,
    hotelName: string,
    bookingDetails: {
      checkInDate: string;
      checkOutDate: string;
      roomTypeCode: string;
      numberOfRooms: number;
      roomTotalPrice: number;
      currencyCode: string;
      guests: { firstName: string; lastName: string; category: string; ageCode: string; }[];
    }
  ): Promise<void> {
    const htmlContent = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #1a73e8;
            color: #ffffff;
            padding: 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 20px;
          }
          .content h2 {
            color: #333333;
            font-size: 20px;
            margin-top: 0;
          }
          .content p {
            color: #666666;
            line-height: 1.6;
            margin: 10px 0;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .details-table th,
          .details-table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #dddddd;
          }
          .details-table th {
            background-color: #f8f8f8;
            color: #333333;
            font-weight: bold;
          }
          .footer {
            background-color: #f4f4f4;
            padding: 15px;
            text-align: center;
            color: #888888;
            font-size: 12px;
          }
          .button {
            display: inline-block;
            padding: 10px 20px;
            margin: 20px 0;
            background-color: #1a73e8;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          }
          @media only screen and (max-width: 600px) {
            .container {
              width: 100%;
              margin: 10px;
            }
            .header h1 {
              font-size: 20px;
            }
            .content h2 {
              font-size: 18px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Update Confirmation</h1>
          </div>
          <div class="content">
            <h2>Dear {{guestName}},</h2>
            <p>Your reservation with {{hotelName}} has been successfully updated. Below are the updated details for your booking.</p>
            <h2>Updated Reservation Details</h2>
            <table class="details-table">
              <tr>
                <th>Hotel Name</th>
                <td>{{hotelName}}</td>
              </tr>
              <tr>
                <th>Check-In Date</th>
                <td>{{checkInDate}}</td>
              </tr>
              <tr>
                <th>Check-Out Date</th>
                <td>{{checkOutDate}}</td>
              </tr>
              <tr>
                <th>Room Type</th>
                <td>{{roomTypeCode}}</td>
              </tr>
              <tr>
                <th>Number of Rooms</th>
                <td>{{numberOfRooms}}</td>
              </tr>
              <tr>
                <th>Total Price</th>
                <td>{{roomTotalPrice}} {{currencyCode}}</td>
              </tr>
              <tr>
                <th>Contact Email</th>
                <td>{{email}}</td>
              </tr>
            </table>
            <h2>Guest Details</h2>
            <table class="details-table">
              <tr>
                <th>Name</th>
                <th>Age Category</th>
              </tr>
              {{#each guests}}
              <tr>
                <td>{{firstName}} {{lastName}}</td>
                <td>{{category}} (Age {{age}})</td>
              </tr>
              {{/each}}
            </table>
            <p>If you have any questions or need further modifications to your reservation, please contact us at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>
            <a href="{{websiteUrl}}" class="button">View Your Updated Reservation</a>
          </div>
          <div class="footer">
            <p>© {{currentYear}} {{companyName}}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>`;

    const templateData = {
      guestName: `${bookingDetails.guests[0].firstName} ${bookingDetails.guests[0].lastName}`,
      hotelName,
      checkInDate: new Date(bookingDetails.checkInDate).toLocaleDateString(),
      checkOutDate: new Date(bookingDetails.checkOutDate).toLocaleDateString(),
      roomTypeCode: bookingDetails.roomTypeCode,
      numberOfRooms: bookingDetails.numberOfRooms,
      roomTotalPrice: bookingDetails.roomTotalPrice,
      currencyCode: bookingDetails.currencyCode,
      email,
      guests: bookingDetails.guests,
      supportEmail: 'business.alhajz@gmail.com',
      websiteUrl: 'https://alhajz.ai',
      currentYear: new Date().getFullYear(),
      companyName: 'Al-Hajz',
    };

    const template = Handlebars.compile(htmlContent);
    const finalHtml = template(templateData);

    await this.mailer.sendMail({
      to: email,
      subject: `Booking Confirmation - ${hotelName}`,
      html: finalHtml,
      text: `Your reservation update has been confirmed`,
    });
  }

  /**
   * Helper for Booking Modification
   * Used in: updateBooking
   */
  async increaseRoomsBeforeBooking(
    reservationId: string,
  ) {

    const requiredFields = { reservationId };
    await this.checkRequiredField(requiredFields);

    const reservationDetails = await this.getBookings(reservationId);
    if (!reservationDetails) {
      throw new Error("No reservation details found for room reduce");
    }
    const { checkInDate, checkOutDate, hotelCode, roomTypeCode, numberOfRooms } = reservationDetails;

    try {
      const dateRange = [];
      let currentDate = new Date(checkInDate);
      const endDate = new Date(checkOutDate);
      while (currentDate < endDate) {
        dateRange.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const inventoryRecords = await Inventory.find({
        hotelCode,
        invTypeCode: roomTypeCode,
        'availability.startDate': {
          $in: dateRange,
        },
      });

      if (!inventoryRecords || inventoryRecords.length === 0) {
        return { message: "No matching room inventory records found for the given dates." };
      }

      const bulkOps = [];

      for (const item of inventoryRecords) {
        const currentCount = item.availability?.count || 0;
        const newCount = currentCount + numberOfRooms;

        bulkOps.push({
          updateOne: {
            filter: { _id: item._id },
            update: {
              $set: {
                'availability.count': newCount,
                updatedAt: new Date(),
              },
            },
          },
        });
      }

      const result = await Inventory.bulkWrite(bulkOps);
      console.log("Room counts increased successfully before update reservation.", result);

      return {
        message: "Room counts increased successfully after cancellation.",
        result,
      };
    } catch (error: any) {
      console.error("❌ Error increasing rooms after booking cancellation:", error.message || error);
      throw new Error(`Failed to increase rooms after booking cancellation: ${error.message}`);
    }
  }

  /**
   * Helper for Booking Modification
   * Used in: updateBooking
   * Reduce number of rooms after successfully updating reservation
   */
  async reduceRoomsAfterBookingUpdateConfirmed(
    hotelCode: string,
    roomTypeCode: string,
    numberOfRooms: number,
    dates: Date[]
  ) {
    console.log(`Get data for reduce rooms ${hotelCode} | ${roomTypeCode} | ${numberOfRooms} | ${dates}`);

    const requiredFields = { hotelCode, roomTypeCode, numberOfRooms, dates };
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => value === undefined || value === null || value === "" || (key === 'dates' && (!Array.isArray(value) || value.length !== 2)))
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return {
        message: `Missing required fields: ${missingFields.join(", ")}`,
      };
    }

    const [checkInDate, checkOutDate] = dates;

    if (checkInDate >= checkOutDate) {
      return {
        message: "Check-in date must be before check-out date",
      };
    }

    try {
      // Calculate the date range excluding the checkout date
      const dateRange = [];
      let currentDate = new Date(checkInDate);
      const endDate = new Date(checkOutDate);
      while (currentDate < endDate) {
        dateRange.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const inventoryRecords = await Inventory.find({
        hotelCode,
        invTypeCode: roomTypeCode,
        'availability.startDate': {
          $in: dateRange,
        },
      });

      if (!inventoryRecords || inventoryRecords.length === 0) {
        return { message: "No available rooms found for the specified criteria" };
      }

      const bulkOps = [];

      for (const item of inventoryRecords) {
        const currentCount = item.availability?.count || 0;
        if (currentCount < numberOfRooms) {
          return {
            message: `Not enough rooms for date ${item.availability?.startDate}. Available: ${currentCount}, requested: ${numberOfRooms}`,
          };
        }

        const newCount = currentCount - numberOfRooms;

        bulkOps.push({
          updateOne: {
            filter: { _id: item._id },
            update: {
              $set: {
                'availability.count': newCount,
                updatedAt: new Date(),
              },
            },
          },
        });
      }

      const result = await Inventory.bulkWrite(bulkOps);

      return {
        message: "Room counts reduced successfully for booking",
        result,
      };

    } catch (error: any) {
      console.error("❌ Error reducing rooms after booking confirmed:", error.message || error);
      return { message: "Failed to reduce rooms after booking confirmed" };
    }
  };



  /**
   * Service function to create booking with Pay at Hotel option
   */
  async createBookingWithPayAtHotel(bookingInput: CreateBookingInput) {
    try {
      if (!bookingInput) {
        throw new Error("No booking input found to create booking");
      }

      /**
       * Check for required fields
       * If not found, throw error
       */
      await this.checkRequiredField(bookingInput);

      /**
       * Validate booking dates
       * If invalid, throw error
       */
      await this.validateBookingDates(bookingInput.checkInDate, bookingInput.checkOutDate);

      /**
       * Process guests to categorize them and get age code summary
       */
      const { categorizedGuests, ageCodeSummary } = await this.processGuests(bookingInput.guests);

      await this.requestForThirdPartyReservation({
        ...bookingInput,
        guests: categorizedGuests,
        ageCodeSummary,
      })
      return { categorizedGuests, ageCodeSummary };
    }
    catch (error: any) {
      console.log("Error in createBookingWithPayAtHotel", error);
      throw new Error("Failed to create booking with Pay at Hotel option");
    }
  }

    private async requestForThirdPartyReservation(bookDetails: any) {
    try {
      if (!bookDetails) {
        throw new Error("No booking details found to request for third party reservation");
      }
      console.log("Requesting for third party reservation with details:", bookDetails);
      
      /**
       * Step 1: Get property ID from hotel code
       */
      const property = await PropertyInfo.findOne({ property_code: bookDetails.hotelCode });
      
      if (!property) {
        throw new Error(`Property not found with code: ${bookDetails.hotelCode}`);
      }

      const propertyId = property._id.toString();
      console.log(`Property found: ${property.property_name} (ID: ${propertyId})`);

      /**
       * Step 2: Process reservation through PMS Orchestrator
       * This will route to the correct PMS based on property configuration
       */
      try {
        await PMSOrchestrator.processReservation(propertyId, bookDetails);
        console.log('✅ Reservation successfully sent to PMS');
      } catch (pmsError: any) {
        console.error('❌ PMS integration failed:', pmsError.message);
        // Log error but continue - we still want to update inventory and send email
        console.warn('⚠️ Continuing with local reservation processing despite PMS failure');
      }

      /**
       * Step 3: Reduce room counts after booking confirmed
       */
      await this.reduceRoomsAfterBookingConfirmed(
        bookDetails.hotelCode,
        bookDetails.roomTypeCode,
        bookDetails.numberOfRooms,
        [bookDetails.checkInDate, bookDetails.checkOutDate],
      );

      /**
       * Step 4: Send booking confirmation email
       */
      const htmlContent = `<!DOCTYPE html>
                    <html lang="en">
            
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <style>
                        body {
                          font-family: Arial, sans-serif;
                          background-color: #f4f4f4;
                          margin: 0;
                          padding: 0;
                        }
            
                        .container {
                          max-width: 600px;
                          margin: 20px auto;
                          background-color: #ffffff;
                          border-radius: 8px;
                          overflow: hidden;
                          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        }
            
                        .header {
                          background-color: #1a73e8;
                          color: #ffffff;
                          padding: 20px;
                          text-align: center;
                        }
            
                        .header h1 {
                          margin: 0;
                          font-size: 24px;
                        }
            
                        .content {
                          padding: 20px;
                        }
            
                        .content h2 {
                          color: #333333;
                          font-size: 20px;
                          margin-top: 0;
                        }
            
                        .content p {
                          color: #666666;
                          line-height: 1.6;
                          margin: 10px 0;
                        }
            
                        .details-table {
                          width: 100%;
                          border-collapse: collapse;
                          margin: 20px 0;
                        }
            
                        .details-table th,
                        .details-table td {
                          padding: 10px;
                          text-align: left;
                          border-bottom: 1px solid #dddddd;
                        }
            
                        .details-table th {
                          background-color: #f8f8f8;
                          color: #333333;
                          font-weight: bold;
                        }
            
                        .footer {
                          background-color: #f4f4f4;
                          padding: 15px;
                          text-align: center;
                          color: #888888;
                          font-size: 12px;
                        }
            
                        .button {
                          display: inline-block;
                          padding: 10px 20px;
                          margin: 20px 0;
                          background-color: #1a73e8;
                          color: #ffffff;
                          text-decoration: none;
                          border-radius: 5px;
                          font-weight: bold;
                          text-color
                        }
            
                        @media only screen and (max-width: 600px) {
                          .container {
                            width: 100%;
                            margin: 10px;
                          }
            
                          .header h1 {
                            font-size: 20px;
                          }
            
                          .content h2 {
                            font-size: 18px;
                          }
                        }
                      </style>
                    </head>
            
                    <body>
                      <div class="container">
                        <div class="header">
                          <h1>Booking Confirmation</h1>
                        </div>
                        <div class="content">
                          <h2>Dear {{guestName}},</h2>
                          <p>Thank you for your booking with {{hotelName}}! We are excited to confirm your booking details below.</p>
            
                          <h2>Reservation Details</h2>
                          <table class="details-table">
                            <tr>
                              <th>Hotel Name</th>
                              <td>{{hotelName}}</td>
                            </tr>
                            <tr>
                              <th>Check-In Date</th>
                              <td>{{checkInDate}}</td>
                            </tr>
                            <tr>
                              <th>Check-Out Date</th>
                              <td>{{checkOutDate}}</td>
                            </tr>
                            <tr>
                              <th>Room Type</th>
                              <td>{{roomTypeCode}}</td>
                            </tr>
                            <tr>
                              <th>Number of Rooms</th>
                              <td>{{numberOfRooms}}</td>
                            </tr>
                            <tr>
                              <th>Total Price</th>
                              <td>{{roomTotalPrice}} {{currencyCode}}</td>
                            </tr>
                            <tr>
                              <th>Contact Email</th>
                              <td>{{email}}</td>
                            </tr>
                            <tr>
                              <th>Contact Phone</th>
                              <td>+{{phone}}</td>
                            </tr>
                          </table>
            
                          <h2>Guest Details</h2>
                          <table class="details-table">
                            <tr>
                              <th>Name</th>
                              <th>Age Category</th>
                            </tr>
                            {{#each guests}}
                            <tr>
                              <td>{{firstName}} {{lastName}}</td>
                              <td>{{category}} (Age {{age}})</td>
                            </tr>
                            {{/each}}
                          </table>
            
                          <p>For any questions or to modify your reservation, please contact us at <a
                              href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>
            
                          <a href="{{websiteUrl}}" class="button">View Your Booking</a>
                        </div>
                        <div class="footer">
                          <p>&copy; {{currentYear}} {{companyName}}. All rights reserved.</p>
                        </div>
                      </div>
                    </body>
            
                    </html>`;

      const templateData = {
        guestName: `${bookDetails.guests[0].firstName} ${bookDetails.guests[0].lastName}`,
        hotelName: bookDetails.hotelName,
        checkInDate: new Date(bookDetails.checkInDate).toLocaleDateString(),
        checkOutDate: new Date(bookDetails.checkOutDate).toLocaleDateString(),
        roomTypeCode: bookDetails.roomTypeCode,
        numberOfRooms: bookDetails.numberOfRooms,
        roomTotalPrice: bookDetails.roomTotalPrice,
        currencyCode: bookDetails.currencyCode,
        email: bookDetails.email,
        phone: bookDetails.phone,
        guests: bookDetails.guests,
        supportEmail: 'business.alhajz@gmail.com',
        // supportPhone: '+1-800-123-4567',
        websiteUrl: 'https://alhajz.ai',
        currentYear: new Date().getFullYear(),
        companyName: 'Al-Hajz',
      };

      // Compile the Handlebars template
      const template = Handlebars.compile(htmlContent);

      // Generate the final HTML by replacing placeholders with actual data
      const finalHtml = template(templateData);

      await this.mailer.sendMail({
        to: bookDetails.email,
        subject: `Booking Confirmation - ${bookDetails.hotelName}`,
        html: finalHtml,
        text: `Your reservation update has been confirmed`,
      });

    }
    catch (error: any) {
      console.log("Error in requestForThirdPartyReservation", error);
      throw new Error("Failed to request for third party reservation");
    }
  }

  private async reduceRoomsAfterBookingConfirmed(
    hotelCode: string,
    roomTypeCode: string,
    numberOfRooms: number,
    dates: Date[]
  ) {
    const requiredFields = { hotelCode, roomTypeCode, numberOfRooms, dates };
    /**
     * Check for required fields
     * if not found, throw error
     */
    await this.checkRequiredField(requiredFields);

    const [checkInDate, checkOutDate] = dates;
    /**
     * Validate booking dates
     */
    if (checkInDate >= checkOutDate) {
      throw new Error("Check-in date must be before check-out date");
    }

    try {
      const dateRange = [];
      let currentDate = new Date(checkInDate);
      const endDate = new Date(checkOutDate);
      while (currentDate < endDate) {
        dateRange.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const inventoryRecords = await Inventory.find({
        hotelCode,
        invTypeCode: roomTypeCode,
        'availability.startDate': {
          $in: dateRange,
        },
      });

      if (!inventoryRecords || inventoryRecords.length === 0) {
        return { message: "No available rooms found for the specified criteria" };
      }

      const bulkOps = [];

      for (const item of inventoryRecords) {
        const currentCount = item.availability?.count || 0;
        if (currentCount < numberOfRooms) {
          return {
            message: `Not enough rooms for date ${item.availability?.startDate}. Available: ${currentCount}, requested: ${numberOfRooms}`,
          };
        }

        const newCount = currentCount - numberOfRooms;

        bulkOps.push({
          updateOne: {
            filter: { _id: item._id },
            update: {
              $set: {
                'availability.count': newCount,
                updatedAt: new Date(),
              },
            },
          },
        });
      }

      const result = await Inventory.bulkWrite(bulkOps);

      return {
        message: "Room counts reduced successfully for booking",
        result,
      };
    }
    catch (error: any) {
      console.log("Error in reduceRoomsAfterBookingConfirmed", error);
      throw new Error("Failed to reduce rooms after booking confirmed");
    }
  }
}