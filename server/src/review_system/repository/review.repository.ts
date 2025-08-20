import { ObjectId } from "mongoose";
import { CustomerReviewModel } from "../model";
import { ThirdPartyBooking } from "../../wincloud/src/model/reservationModel";

export class CustomerReviewRepository {

    async newReviewCreate(
        reservationId: string,
        hotelCode: string,
        hotelName: string,
        userId: ObjectId,
        guestEmail: string,
        comment: string,
        rating: number,
        categorizedRating: string
    ) {
        const requiredFields = {
            reservationId, hotelCode, hotelName, userId, guestEmail, comment, rating, categorizedRating
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => value === undefined || value === null || value === "")
            .map(([key]) => key);

        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
        }

        const reservationData = await ThirdPartyBooking.findOne({ reservationId: reservationId });

        if (!reservationData) {
            throw new Error (`Reservation data not found with your provided ${reservationId}`);
        }

        if (
            hotelCode !== reservationData.hotelCode
            || hotelName !== reservationData.hotelName
            || userId.toString() !== reservationData.userId.toString()
            || guestEmail !== reservationData.email
        ) {
            throw new Error("Data do not match with existing data");
        }

        const createReviewData = await CustomerReviewModel.create({
            reservationId,
            hotelCode,
            hotelName,
            userId,
            guestEmail,
            comment,
            rating,
            categorizedRating,
        });
        if (!createReviewData) {
            throw new Error("Error at create review data")
        }
    };

    async getReviews(filters: any) {
        const reviewDetails = await CustomerReviewModel.find(filters).sort({ createdAt: -1 });
        
        if (!reviewDetails.length || !reviewDetails) {
            throw new Error("No review data found. Please check your provided details.");
        }
        return reviewDetails;
    };

    async updateReview(reviewId: string, userId, updatedData: any) {

        const restrictedFields = ["reviewId", "hotelCode", "userId", "userEmail"];

        /**
         * This deletes each field which are in RestrictedFields
         */
        restrictedFields.forEach(field => delete updatedData[field]);
        
        const updatedReview = await CustomerReviewModel.findOneAndUpdate(
            { _id: reviewId, userId: userId },
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