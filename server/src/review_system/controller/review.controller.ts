import { CustomerReviewService, ReservationService } from "../service";
import { Request, Response } from "express";

const customerReviewService = new CustomerReviewService();
const reservationService = new ReservationService();

export class CustomerReviewController {

    async createCustomerReview(req: Request, res: Response) {
        try {
            const review = await customerReviewService.addCustomerReview(req.body);

            res.status(201).json({
                message: "Review created successfully",
                data: review
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getCustomerReview(req: Request, res: Response) {
        try {
            const reviews = await customerReviewService.getAllReviews(req.query);
            res.status(200).json({
                success: true,
                data: reviews
            });
        }
        catch (error: any) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateReview(req: Request, res: Response) {
        try {
            const customerId = (req.user as any).id;
            console.log(`The customer id ${customerId}`);
            if (!customerId || customerId.length === 0) {
                throw new Error("No customer id found");
            }
            const { reviewId } = req.params;
            const updatedReview = await customerReviewService.updateCustomerReview(reviewId, customerId, req.body);
            res.status(200).json({
                success: true,
                message: "Review updated successfully",
                data: updatedReview
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async deleteReview(req: Request, res: Response) {
        try {
            const customerId = (req.user as any).id;
            if (!customerId || customerId.length === 0) {
                throw new Error("No customer ID found");
            }

            const { reviewId } = req.params;
            const deletedReview = await customerReviewService.deleteCustomerReview(reviewId, customerId);

            res.status(200).json({
                success: true,
                message: "Review deleted successfully",
                data: deletedReview
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async emailSend(req: Request, res: Response) {
        const reservationId = req.params.id;
        if (!reservationId) {
            throw new Error("Reservation Id not found");
        }
        try {
            const emailSendResult = await customerReviewService.sendEmailToCustomer(reservationId);
            if (emailSendResult.success) {
                return res.status(200).json({ message: emailSendResult.message });
            } else {
                return res.status(400).json({ error: emailSendResult.message });
            }
        } catch (error: any) {
            console.error("❌ emailSend error:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }

}