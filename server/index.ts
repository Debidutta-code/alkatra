import { connect } from "mongoose";
import config from "./Common_API's/index";
import { app } from "./app";
import { initializeExpressRoutes } from "./Common_API's/express";
import { createPropertyIndexAndDoc } from "./search-engine/src/sync_controllers/syncData";
import { Room } from "./Property_Management/src/model/room.model";
import elasticClient from "./search-engine/src/service/elasticsearch";

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

    // call these functions only when database connection successful
    // checkElasticClient();
    // createPropertyIndexAndDoc();
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