import { ReservationInput, CategorizedGuest } from '../interfaces';
import { ReservationRepository } from '../repository';
import { default as stripeService } from '../services/stripe.service';
import { MailFactory } from "../../../customer_authentication/src/services/mailFactory";
import Handlebars from 'handlebars';
import { calculateAgeCategory } from '../utils/ageCategory';
import ErrorHandler from '../utils/errorHandler';


const mailer = MailFactory.getMailer();

export class ReservationService {
    
    private static instance: ReservationService;
    private reservationRepository: ReservationRepository;

    constructor() {
        this.reservationRepository = new ReservationRepository();
    }

    static getInstance(): ReservationService {
        if (!ReservationService.instance) {
            ReservationService.instance = new ReservationService();
        }
        return ReservationService.instance;
    }

    async createReservation(reservationInput: ReservationInput, paymentMethodId: string) {
        const { bookingDetails } = reservationInput;
        const { guests, email, phone, hotelName, checkInDate, checkOutDate, roomTypeCode, numberOfRooms, roomTotalPrice, currencyCode } = bookingDetails;

        // Categorize guests and calculate age code summary
        const ageCodeSummary: Record<string, number> = { '7': 0, '8': 0, '10': 0 };
        const categorizedGuests: CategorizedGuest[] = guests.map(({ firstName, lastName, dob }) => {
            if (!dob) throw new Error(`DOB missing for ${firstName} ${lastName}`);
            const { age, category, ageCode } = calculateAgeCategory(dob);
            ageCodeSummary[ageCode] = (ageCodeSummary[ageCode] || 0) + 1;
            return { firstName, lastName, dob, age, category, ageCode };
        });

        console.log(`Email: ${email}, Payment Method ID: ${paymentMethodId}`);

        // Create or retrieve Stripe customer
        const customerResult = await stripeService.createOrRetrieveCustomer(
            email,
            `${guests[0].firstName} ${guests[0].lastName}`,
            phone,
            paymentMethodId
        );

        if (!customerResult.success) {
            throw new ErrorHandler(customerResult.error || 'Stripe customer creation failed', 500);
        }

        // Process third-party reservation
        await this.reservationRepository.processThirdPartyReservation({
            ...reservationInput,
            ageCodeSummary,
        });

        // Reduce room inventory
        const reduceRoomResult = await this.reservationRepository.reduceRooms(
            bookingDetails.hotelCode,
            bookingDetails.roomTypeCode,
            bookingDetails.numberOfRooms,
            [new Date(checkInDate), new Date(checkOutDate)]
        );

        if (!reduceRoomResult) {
            throw new Error('Failed to reduce rooms');
        }

        // Send confirmation email
        await this.sendConfirmationEmail({
            guestName: `${guests[0].firstName} ${guests[0].lastName}`,
            hotelName,
            checkInDate: new Date(checkInDate).toLocaleDateString(),
            checkOutDate: new Date(checkOutDate).toLocaleDateString(),
            roomTypeCode,
            numberOfRooms,
            roomTotalPrice,
            currencyCode,
            email,
            phone,
            guests: categorizedGuests,
        });

        return { categorizedGuests, ageCodeSummary };
    }

    private async sendConfirmationEmail(templateData: {
        guestName: string;
        hotelName: string;
        checkInDate: string;
        checkOutDate: string;
        roomTypeCode: string;
        numberOfRooms: number;
        roomTotalPrice: number;
        currencyCode: string;
        email: string;
        phone: string;
        guests: CategorizedGuest[];
    }) {
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
            <p>For any questions or to modify your reservation, please contact us at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a>.</p>
            <a href="{{websiteUrl}}" class="button">View Your Booking</a>
            </div>
            <div class="footer">
            <p>&copy; {{currentYear}} {{companyName}}. All rights reserved.</p>
            </div>
        </div>
        </body>
        </html>`;

        const template = Handlebars.compile(htmlContent);
        const finalHtml = template({
            ...templateData,
            supportEmail: 'business.alhajz@gmail.com',
            websiteUrl: 'https://alhajz.ai',
            currentYear: new Date().getFullYear(),
            companyName: 'Al-Hajz',
        });

        await mailer.sendMail({
            to: templateData.email,
            subject: `Booking Confirmation - ${templateData.hotelName}`,
            html: finalHtml,
            text: `Your booking has been confirmed`,
        });
    }
}