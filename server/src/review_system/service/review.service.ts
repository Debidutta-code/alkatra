import { IReview } from "../model";
import { CustomerReviewRepository } from "../repository";

const customerReviewRepository = new CustomerReviewRepository();

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
            throw new Error (`Missing required fields: ${missingFields.join(", ")}`);
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
    }

    async deleteCustomerReview(reviewId: string, customerId: string) {
        if (!reviewId || !customerId) {
            throw new Error("Review ID and Customer ID are required");
        }
        return await customerReviewRepository.deleteReview(reviewId, customerId);
    }

}
