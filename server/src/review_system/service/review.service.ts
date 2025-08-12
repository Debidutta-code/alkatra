import { IReview } from "../model";
import { CustomerReviewRepository } from "../repository";

const customerReviewRepository = new CustomerReviewRepository();

export class CustomerReviewService {

    async addCustomerReview(reviewData: Partial<IReview>) {
        if (!reviewData.hotelId || !reviewData.hotelCode || !reviewData.userId || !reviewData.userEmail || !reviewData.comment) {
            throw new Error("Missing required review fields");
        }
        return await customerReviewRepository.newReviewCreate(reviewData);
    };

    async getAllReviews(query: any) {
        const filters: any = {};

        if (query.userId) filters.userId = query.userId;
        if (query.userEmail) filters.userEmail = query.userEmail;
        if (query.hotelId) filters.hotelId = query.hotelId;
        if (query.hotelCode) filters.hotelCode = query.hotelCode;

        return await customerReviewRepository.getReviews(filters);
    };

    async updateCustomerReview(reviewId: string, customerId, reviewData: Partial<IReview>) {
        if (!reviewId || !customerId) {
            throw new Error("Review ID and Customer ID is required");
        }
        return await customerReviewRepository.updateReview(reviewId, customerId, reviewData);
    }

    async deleteCustomerReview(reviewId: string, customerId: string) {
        if (!reviewId || !customerId) {
            throw new Error("Review ID and Customer ID are required");
        }
        return await customerReviewRepository.deleteReview(reviewId, customerId);
    }

}
