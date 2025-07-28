"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
process.env.NODE_ENV = process.env.NODE_ENV || "development";
exports.default = {
    port: parseInt(process.env.PORT || "8040", 10),
    isDev: process.env.IS_DEV == "true",
    mongoURI: process.env.EXTRANET_MONGO_URI_TESTING,
    jwtSecretKeyDev: process.env.JWT_SECRET_KEY_DEV,
    jwtSecretKey: process.env.JWT_SECRET_KEY,
    jwtExpiresInDev: process.env.JWT_SECRET_KEY_DEV,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    kafkaBootstrapServers: process.env.KAFKA_BOOTSTRAP_SERVERS,
    kafkaAuthTopic: process.env.KAFKA_AUTH_TOPIC,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleFrontendCallbackUrl: process.env.GOOGLE_FRONTEND_CALLBACK_URL,
};
//# sourceMappingURL=index.js.map