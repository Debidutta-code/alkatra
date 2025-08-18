import { IReview } from "../model";
import { CustomerReviewRepository } from "../repository";
import { ReservationService } from "./reservation.service";
import { MailFactory } from "../../customer_authentication/src/services/mailFactory";

const customerReviewRepository = new CustomerReviewRepository();
const reservationService = new ReservationService();

export class CustomerReviewService {

    async addCustomerReview(reviewData) {
        const { reservationId, hotelCode, hotelName, userId, guestEmail, comment, rating } = reviewData;

        const requiredFields = {
            reservationId, hotelCode, hotelName, userId, guestEmail, comment, rating
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => value === undefined || value === null || value === "")
            .map(([key]) => key);

        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
        }
        return await customerReviewRepository.newReviewCreate(reservationId, hotelCode, hotelName, userId, guestEmail, comment, rating);
    };

    async getAllReviews(query: any) {
        const filters: any = {};

        if (query.userId) filters.userId = query.userId;
        if (query.guestEmail) filters.userEmail = query.userEmail;
        if (query.hotelCode) filters.hotelCode = query.hotelCode;

        return await customerReviewRepository.getReviews(filters);
    };

    async updateCustomerReview(reviewId: string, userId, reviewData: Partial<IReview>) {
        if (!reviewId || !userId) {
            throw new Error("Review ID and Customer ID is required");
        }
        return await customerReviewRepository.updateReview(reviewId, userId, reviewData);
    };

    async deleteCustomerReview(reviewId: string, customerId: string) {
        if (!reviewId || !customerId) {
            throw new Error("Review ID and Customer ID are required");
        }
        return await customerReviewRepository.deleteReview(reviewId, customerId);
    };

    async sendEmailToCustomer(reservationId: string) {
        try {
            const reservationData = await reservationService.getReservationData(reservationId);
            const reviewUiUrl = process.env.REVIEW_UI_URL;

            if (!reservationData) {
                return { success: false, message: "No reservation data found for Email Send" };
            }

            // Normalize dates to ignore time part
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const checkoutDate = new Date(reservationData.checkOutDate);
            checkoutDate.setHours(0, 0, 0, 0);

            if (checkoutDate.getTime() !== today.getTime()) {
                return { success: false, message: "Not checkout date, email skipped" };
            }

            const toCustomerEmail = reservationData.email;
            const emailSubject = "Please provide your review";

            const text = `Dear Customer, thank you for staying with us at ${reservationData.hotelName}. 
                We value your feedback! Please click the link below to share your review.`;

            const html = `
            <p>Dear Customer,</p>
            <p>Thank you for staying with us at <b>${reservationData.hotelName}</b>.</p>
            <p>We value your feedback! Please click the link below to share your review:</p>
            <a href="${reviewUiUrl}/${reservationId}" target="_blank">Leave a Review</a>
            <p>Best regards,<br/>Hotel Team</p>`;

            const mailer = MailFactory.getMailer();

            console.log(`The mailer we get ${mailer}`);
            
            await mailer.sendMail({
                to: toCustomerEmail,
                subject: emailSubject,
                text,
                html,
            });

            return { success: true, message: `Review email sent to ${toCustomerEmail}` };
        } catch (error: any) {
            console.error("sendEmailToCustomer error:", error);
            return { success: false, message: `Internal server error: ${error.message || error}` };
        }
    }

}
