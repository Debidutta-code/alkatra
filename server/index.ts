import { connect } from "mongoose";
import config from "./Common_API/index";
import { app } from "./app";
import { initializeExpressRoutes } from "./Common_API/express";
import { createPropertyIndexAndDoc } from "./search-engine/src/sync_controllers/syncData";
import { Room } from "./Property_Management/src/model/room.model";
import elasticClient from "./search-engine/src/service/elasticsearch";
import cron from "node-cron";
import CryptoPaymentDetails from './Booking_Engine/src/models/cryptoPayment.model';
import cors from 'cors';
import passport from 'passport';


// Middleware
app.use(passport.initialize());

async function checkElasticClient() {
  try {
    // Check if Elasticsearch is reachable
    const health = await elasticClient().cluster.health();
    console.log(`Elasticsearch connection successful clusterHealth: ${health?.status}`);
  }
  catch (error: any) {
    console.log({
      message: "Error connecting to Elasticsearch",
      error: error.message,
    });
  }
}

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

(async () => {
  const changeStream = Room.watch();
  changeStream.on("change", (next) => {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>", "change");

    createPropertyIndexAndDoc();
    // close();
  });

  async function close() {
    await changeStream.close();
  }
})();

// CORN job implemented to auto cancel
cron.schedule("*/1 * * * *", async () => {
  try {
    const fortyMinutesAgo = new Date(Date.now() - 40 * 60 * 1000);
    const result = await CryptoPaymentDetails.updateMany(
      {
        status: "Pending",
        createdAt: { $lte: fortyMinutesAgo }
      },
      {
        $set: { status: "Cancelled" }
      }
    );
    if (result.modifiedCount > 0) {
      console.log(`[AUTO-CANCEL] ${result.modifiedCount} pending payments marked as Cancelled.`);
    }
  } catch (error) {
    console.error("[AUTO-CANCEL ERROR]", error);
  }
});