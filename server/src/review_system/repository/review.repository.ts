import { CustomerReviewModel } from "../model";

export class CustomerReviewRepository {

    async newReviewCreate(data: any) {
        const createReviewData = await CustomerReviewModel.create(data);
        if (!createReviewData) {
            throw new Error("Error at create review data")
        }
    };

    async getReviews(filters: any) {
        const reviewDetails = await CustomerReviewModel.find(filters).sort({ createdAt: -1 });
        console.log(`The review details we get ${JSON.stringify(reviewDetails)}`)
        if (!reviewDetails.length || !reviewDetails) {
            throw new Error("No review data found. Please check your provided details.");
        }
        return reviewDetails;
    };

    async updateReview(reviewId: string, customerId, updatedData: any) {
        const updatedReview = await CustomerReviewModel.findByIdAndUpdate(
            { _id: reviewId, customerId: customerId },
            { $set: updatedData },
            { new: true }
        );
        if (!updatedReview) {
            throw new Error("Review not found or update failed");
        }
        return updatedReview;
    }

    async deleteReview(reviewId: string, customerId: string) {
        const deletedReview = await CustomerReviewModel.findOneAndDelete({
            _id: reviewId,
            customerId: customerId
        });

        if (!deletedReview) {
            throw new Error("Review not found or delete failed");
        }
        return deletedReview;
    }


}