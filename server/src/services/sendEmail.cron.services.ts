import cron, { ScheduledTask } from "node-cron";
import { ThirdPartyBooking } from "../wincloud/src/model/reservationModel";
import { CustomerReviewService } from "../review_system/service";

const customerReviewService = new CustomerReviewService();


class SendEmailCronService {
    private static instance: SendEmailCronService;
    private job?: ScheduledTask;

    private constructor() { }

    public static getInstance(): SendEmailCronService {
        if (!SendEmailCronService.instance) {
            SendEmailCronService.instance = new SendEmailCronService();
        }
        return SendEmailCronService.instance;
    }

    public start(): void {

        if (this.job) return; 

        this.job = cron.schedule("0 0 0 * * *", async () => {
            try {
                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = new Date();
                endOfDay.setHours(23, 59, 59, 999);

                const reservationData = await ThirdPartyBooking.find({
                    status: { $ne: "Cancelled" },
                    checkOutDate: { $gte: startOfDay, $lte: endOfDay }
                }).select("reservationId checkOutDate");

                console.log(`The reservation data we get: ${JSON.stringify(reservationData)}`);

                if (reservationData && reservationData.length > 0) {
                    for (const reservation of reservationData) {
                        try {
                            const result = await customerReviewService.sendEmailToCustomer(reservation.reservationId);

                            if (result.success) {
                                console.log(`📧 Email sent for Reservation ${reservation.reservationId}`);
                            } else {
                                console.warn(`⚠️ Failed to send email for ${reservation.reservationId}: ${result.message}`);
                            }
                        } catch (err) {
                            console.error(`❌ Error sending email for reservation ${reservation.reservationId}`, err);
                        }
                    }
                }
            } catch (error) {
                console.error("[SEND-EMAIL ERROR]", error);
            }
        });


        this.job.start();
        console.log("✅ SendEmailCron started");
    }

    public stop(): void {
        if (this.job) {
            this.job.stop();
            this.job = undefined;
            console.log("🛑 SendEmailCron stopped");
        }
    }
}

export const sendEmailCron = SendEmailCronService.getInstance();
