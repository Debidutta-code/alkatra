import { config } from "dotenv";
config();


process.env.NODE_ENV = process.env.NODE_ENV || "development";

export default {
  port: parseInt(process.env.PORT || "8040", 10),
  isDev: process.env.IS_DEV == "true",
  mongoURI: process.env.MONGO_URI,
  jwtSecretKeyDev: process.env.JWT_SECRET_KEY_DEV,
  jwtSecretKey: process.env.JWT_SECRET_KEY,
  jwtExpiresInDev: process.env.JWT_SECRET_KEY_DEV,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  kafkaBootstrapServers: process.env.KAFKA_BOOTSTRAP_SERVERS,
  kafkaAuthTopic: process.env.KAFKA_AUTH_TOPIC,
};
