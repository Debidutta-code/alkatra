// import dotenv from "dotenv"
// import connectDB from "../db/index";
// import { app } from "./app";
// import elasticClient from "./service/elasticsearch";
// import Hotel from "./model/hotel.model";
// import './model/property.info.model';
// import './model/property.aminites.model';
// import { createPropertyIndexAndDoc} from "./sync_controllers/syncData";
// import { Room } from "./model/room.model";


// dotenv.config()

// async function checkElasticClient() {
//     try {
//         // Check if Elasticsearch is reachable
//         const health = await elasticClient().cluster.health();
//         console.log(`Elasticsearch connection successful clusterHealth: ${health?.status}`);
//       } catch (error:any) {
//         // res.status(500).json({ message: 'Error connecting to Elasticsearch', error: error.message });
//         console.log({ message: 'Error connecting to Elasticsearch', error: error.message });
//       }
// }
// connectDB()
// .then(() => {
//     // elasticClient.ping()
//     app.listen(process.env.PORT || 8000, () => {
//         console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
//     })
// })
// .catch((err) => {
//     console.log("MONGO db connection failed !!! ", err);
// })
// checkElasticClient();
// createPropertyIndexAndDoc();



// (async()=>{
//     const changeStream = Room.watch();
//     changeStream.on("change", next => {
//         console.log('>>>>>>>>>>>>>>>>>>>>>>>>', 'change');
        
//         createPropertyIndexAndDoc();
//         // close();
//     });

//     async function close() {
//         await changeStream.close();
//     }
// })()