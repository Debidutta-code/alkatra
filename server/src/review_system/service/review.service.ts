import { IReview } from "../model";
import { CustomerReviewRepository } from "../repository";
import { ReservationService } from "./reservation.service";
import { MailFactory } from "../../customer_authentication/src/services/mailFactory";

const customerReviewRepository = new CustomerReviewRepository();
const reservationService = new ReservationService();

export class CustomerReviewService {

    async ratingCategorize(rating: number): Promise<string> {
        if (!rating) {
            throw new Error("Rating not found");
        }

        switch (true) {
            case (rating <= 2):
                return "Poor";
            case (rating > 2 && rating < 4):
                return "Good";
            case (rating >= 4):
                return "Superb";
            default:
                throw new Error("Invalid rating value");
        }
    }

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

        const categorizedRating = await this.ratingCategorize(rating);
        if (!categorizedRating) {
            throw new Error("No categorized rating found");
        }

        return await customerReviewRepository.newReviewCreate(reservationId, hotelCode, hotelName, userId, guestEmail, comment, rating, categorizedRating);
    };


    async getAllReviews(query: any) {
        const filters: any = {};

        // Build OR conditions array
        const orConditions = [];

        const hotelCode = query.hotelCode;

        if (query.userId) orConditions.push({ userId: query.userId });
        if (query.guestEmail) orConditions.push({ guestEmail: query.guestEmail });
        if (query.hotelCode) orConditions.push({ hotelCode: query.hotelCode });
        if (query.reservationId) orConditions.push({ reservationId: query.reservationId });
        if (query.rating) orConditions.push({ rating: query.rating });
        if (query.categoryRating) orConditions.push({ categorizedRating: query.categoryRating });


        // Apply OR logic if any conditions exist
        if (orConditions.length > 0) {
            filters.$and = orConditions;
        }

        // Add date range filtering for createdAt
        if (query.startDate || query.endDate) {
            const dateFilter: any = {};

            if (query.startDate) {
                dateFilter.$gte = new Date(query.startDate);
            }

            if (query.endDate) {
                const endDate = new Date(query.endDate);
                endDate.setHours(23, 59, 59, 999);
                dateFilter.$lte = endDate;
            }

            filters.createdAt = dateFilter;
        }

        const reviews = await customerReviewRepository.getReviews({ hotelCode });

        console.log(`The reviews we get ${JSON.stringify(reviews)}`);

        // Calculate average rating
        let averageRating = null;
        if (reviews.length > 0) {
            const ratings = reviews.map(review => review.rating).filter(rating => rating !== undefined && rating !== null);

            if (ratings.length > 0) {
                const sum = ratings.reduce((total, rating) => total + rating, 0);
                averageRating = parseFloat((sum / ratings.length).toFixed(2));
            }
        }

        const customerReview = await customerReviewRepository.getReviews(filters);
        if (!customerReview) {
            throw new Error ("Reviews not found");
        }
        // return await customerReviewRepository.getReviews(filters);

        return {
            averageRating: averageRating,
            totalReviews: reviews.length,
            customerReview
        };
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
            <a href="${reviewUiUrl}?reservationId=${reservationId}" target="_blank">Leave a Review</a>
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
