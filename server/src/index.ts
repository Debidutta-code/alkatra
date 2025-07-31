import { connect } from "mongoose";
import config from "./common/index";
import { app } from "./app";
import { initializeExpressRoutes } from "./common/express";
import cron from "node-cron";
import CryptoPaymentDetails from './booking_engine/src/models/cryptoPayment.model';
import passport from 'passport';
import { CryptoGuestDetails } from "./booking_engine/src/models/cryptoUserPaymentInitialStage.model";


// Middleware
app.use(passport.initialize());

initializeExpressRoutes({ app }).then(async () => {
  try {
    const connection = await connect(process.env.EXTRANET_MONGO_URI_TESTING! as string);
    console.log(`🏡 Database successfully running on ${connection.connection.host}`);

    app.listen(config.port, () => {
      console.log(`🏡 Server is running on port ${config.port}`);
    });
  }
  catch (err) {
    console.log(`Error: ${err}`);
  }
});


// CORN job implemented to auto cancel
cron.schedule("*/1 * * * *", async () => {
  try {
    const fortyMinutesAgo = new Date(Date.now() - 40 * 60 * 1000);

    console.log("--------***--fortyMinutesAgo---------", fortyMinutesAgo);
    const matches = await CryptoPaymentDetails.find({
      status: "Pending",
      createdAt: { $lte: fortyMinutesAgo }
    });

    console.log("Matching documents:", matches);
    const cryptoPaymentDetails = await CryptoPaymentDetails.updateMany(
      {
        status: "Pending",
        createdAt: { $lte: fortyMinutesAgo }
      },
      {
        $set: { status: "Cancelled" }
      }
    );
    const cryptoGuestDetails = await CryptoGuestDetails.updateMany(
      {
        status: "Processing",
        createdAt: { $lte: fortyMinutesAgo }
      },
      {
        $set: { status: "Cancelled" }
      }
    );
    console.log("--------***-----------", cryptoGuestDetails);
    if (cryptoPaymentDetails.modifiedCount > 0) {
      console.log(`[AUTO-CANCEL] ${cryptoPaymentDetails.modifiedCount} pending payments marked as Cancelled.`);
    }
    if (cryptoGuestDetails.modifiedCount > 0) {
      console.log(`[AUTO-CANCEL] ${cryptoGuestDetails.modifiedCount} processing guest details initiated payments marked as Cancelled.`);
    }
    console.log("--------***-----------");
  } catch (error) {
    console.error("[AUTO-CANCEL ERROR]", error);
  }
});
