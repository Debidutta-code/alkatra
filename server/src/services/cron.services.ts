import cron, { ScheduledTask } from "node-cron";
import CryptoPaymentDetails from "../booking_engine/src/models/cryptoPayment.model";
import { CryptoGuestDetails } from "../booking_engine/src/models/cryptoUserPaymentInitialStage.model";

class AutoCancelCronService {
    private static instance: AutoCancelCronService;
    private job?: ScheduledTask;

    private constructor() { }

    public static getInstance(): AutoCancelCronService {
        if (!AutoCancelCronService.instance) {
            AutoCancelCronService.instance = new AutoCancelCronService();
        }
        return AutoCancelCronService.instance;
    }

    public start(): void {
        if (this.job) return; // Avoid multiple scheduling

        this.job = cron.schedule("*/1 * * * *", async () => {
            try {
                const fortyMinutesAgo = new Date(Date.now() - 40 * 60 * 1000);

                const cryptoPaymentDetails = await CryptoPaymentDetails.updateMany(
                    {
                        status: "Pending",
                        createdAt: { $lte: fortyMinutesAgo }
                    },
                    { $set: { status: "Cancelled" } }
                );

                const cryptoGuestDetails = await CryptoGuestDetails.updateMany(
                    {
                        status: "Processing",
                        createdAt: { $lte: fortyMinutesAgo }
                    },
                    { $set: { status: "Cancelled" } }
                );

                if (cryptoPaymentDetails.modifiedCount > 0) {
                    console.log(`[AUTO-CANCEL] ${cryptoPaymentDetails.modifiedCount} pending payments marked as Cancelled.`);
                }
                if (cryptoGuestDetails.modifiedCount > 0) {
                    console.log(`[AUTO-CANCEL] ${cryptoGuestDetails.modifiedCount} processing guest details marked as Cancelled.`);
                }
            } catch (error) {
                console.error("[AUTO-CANCEL ERROR]", error);
            }
        });

        this.job.start();
        console.log("✅ AutoCancelCron started");
    }

    public stop(): void {
        if (this.job) {
            this.job.stop();
            this.job = undefined;
            console.log("🛑 AutoCancelCron stopped");
        }
    }
}

export const autoCancelCron = AutoCancelCronService.getInstance();
