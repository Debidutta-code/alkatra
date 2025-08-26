import { IReview } from "../model";
import { CustomerReviewRepository } from "../repository";
import { ReservationService } from "./reservation.service";
import { MailFactory } from "../../customer_authentication/src/services/mailFactory";
import { config } from "../../config";


export class CustomerReviewService {
    private static instance: CustomerReviewService;

    private customerReviewRepository = CustomerReviewRepository.getInstance();
    private reservationService = ReservationService.getInstance();

    constructor() { }

    static getInstance(): CustomerReviewService {
        if (!CustomerReviewService.instance) {
            CustomerReviewService.instance = new CustomerReviewService();
        }
        return CustomerReviewService.instance;
    }


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

    async addCustomerReview(reviewData: any) {
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

        return await this.customerReviewRepository.newReviewCreate(reservationId, hotelCode, hotelName, userId, guestEmail, comment, rating, categorizedRating);
    };


    async getAllReviews(query: any) {
        console.log(`The query we get ${JSON.stringify(query)}`);

        const filters: any = {};

        // Build filter conditions directly
        if (query.userId) filters.userId = query.userId;
        if (query.guestEmail) filters.guestEmail = query.guestEmail;
        if (query.hotelCode) filters.hotelCode = query.hotelCode;
        if (query.reservationId) filters.reservationId = query.reservationId;
        if (query.rating) filters.rating = query.rating;
        if (query.categoryRating) filters.categorizedRating = query.categoryRating;

        // Add date range filtering for createdAt
        if (query.startDate || query.endDate) {
            const dateFilter: any = {};
            if (query.startDate) dateFilter.$gte = new Date(query.startDate);
            if (query.endDate) {
                const endDate = new Date(query.endDate);
                endDate.setHours(23, 59, 59, 999);
                dateFilter.$lte = endDate;
            }
            filters.createdAt = dateFilter;
        }

        console.log(`The filters we built: ${JSON.stringify(filters)}`);

        // Get reviews for average calculation (only by hotelCode)
        let averageRating = null;
        let totalReviews = 0;
        if (query.hotelCode) {
            const reviews = await this.customerReviewRepository.getReviews({ hotelCode: query.hotelCode });
            console.log(`The reviews we get ${JSON.stringify(reviews)}`);
            if (reviews.length > 0) {
                const ratings = reviews.map(review => review.rating).filter(rating => rating !== undefined && rating !== null);
                if (ratings.length > 0) {
                    const sum = ratings.reduce((total, rating) => total + rating, 0);
                    averageRating = parseFloat((sum / ratings.length).toFixed(2));
                }
                totalReviews = reviews.length;
            }
        }

        // Log filters before calling getReviews for filtered reviews
        console.log(`Filters before calling getReviews: ${JSON.stringify(filters)}`);

        // Get filtered reviews
        const customerReview = await this.customerReviewRepository.getReviews(filters);
        return {
            averageRating: averageRating,
            totalReviews: totalReviews,
            customerReview: customerReview || []
        };
    }

    async updateCustomerReview(reviewId: string, userId, reviewData: Partial<IReview>) {
        if (!reviewId || !userId) {
            throw new Error("Review ID and Customer ID is required");
        }
        return await this.customerReviewRepository.updateReview(reviewId, userId, reviewData);
    };

    async deleteCustomerReview(reviewId: string, customerId: string) {
        if (!reviewId || !customerId) {
            throw new Error("Review ID and Customer ID are required");
        }
        return await this.customerReviewRepository.deleteReview(reviewId, customerId);
    };

    async sendEmailToCustomer(reservationId: string) {
        try {
            const reservationData = await this.reservationService.getReservationData(reservationId);
            const reviewUiUrl = config.server.reviewUrl;

            console.log("Review URL: ", reviewUiUrl);

            if (!reviewUiUrl || reviewUiUrl === "undefined") {
                console.error("Review URL is not configured properly:", reviewUiUrl);
                return { success: false, message: "Review URL configuration missing" };
            }

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
            const finalReviewUrl = `${reviewUiUrl}?reservationId=${reservationId}`;
            console.log(`Final Review URL: ${finalReviewUrl}`);

            const text = `Dear Customer, thank you for staying with us at ${reservationData.hotelName}. 
                We value your feedback! Please click the link below to share your review.`;

            const html = `
            <p>Dear Customer,</p>
            <p>Thank you for staying with us at <b>${reservationData.hotelName}</b>.</p>
            <p>We value your feedback! Please click the link below to share your review:</p>
            <a href="${finalReviewUrl}" target="_blank">Leave a Review</a>
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
