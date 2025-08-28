import { app } from "./app";
import { mongoClient, config } from "./config";
import { initializeExpressRoutes } from "./common/express";
import { autoCancelCron, sendEmailCron } from "./services";


const { port, host, baseUrl } = config.server;

async function shutdown(signal: string): Promise<void> {
    try {
        console.log(`Received ${signal}, shutting down...`);
        await mongoClient.disconnect();
        autoCancelCron.stop();
        sendEmailCron.stop();
        console.log("Successfully shut down the application.");
    } catch (error) {
        console.error("[SHUTDOWN ERROR]", error);
    } finally {
        process.exit(0); // Ensure the process exits regardless of errors
    }
}

(async () => {
    try {
        /**
         * Connect to database
         */
        await mongoClient.connect();

        /**
         * Initialize express routes
         */
        await initializeExpressRoutes({ app });

        /**
         * Start server
         */
        app.listen(port, host, () => {
            console.log(`🏡 Server is running on port ${baseUrl}`);
        });

        /**
         * Start auto cancel cron job for cryto-payment
         */
        autoCancelCron.start();
        // sendEmailCron.start();

        /**
         * Graceful shutdown
         * Exit the process
         */
        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));

    } catch (error) {
        console.log("Application initialization failed:", error);
        process.exit(1);
    }
})();
