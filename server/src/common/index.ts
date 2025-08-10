import dotenv from "dotenv";
dotenv.config()

const { env } = process;

env.NODE_ENV = env.NODE_ENV || "development";

export default {
  port: parseInt(env.PORT || "8040", 10),
  isDev: env.IS_DEV == "true",
  mongoURI: env.EXTRANET_MONGO_URI_TESTING,
  jwtSecretKeyDev: env.JWT_SECRET_KEY_DEV,
  jwtSecretKey: env.JWT_SECRET_KEY,
  jwtExpiresInDev: env.JWT_SECRET_KEY_DEV,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  kafkaBootstrapServers: env.KAFKA_BOOTSTRAP_SERVERS,
  kafkaAuthTopic: env.KAFKA_AUTH_TOPIC,
  googleClientId: env.GOOGLE_CLIENT_ID,
  googleClientSecret: env.GOOGLE_CLIENT_SECRET,
  googleFrontendCallbackUrl: env.GOOGLE_FRONTEND_CALLBACK_URL,

  // Referral System
  referralSystem: {
    referralLinkBaseUrl: env.REFERRAL_LINK_BASE_URL,
    referRewardAmount: parseInt(env.REFER_REWARD_AMOUNT, 10),
  }
};

