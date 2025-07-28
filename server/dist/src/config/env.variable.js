"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { env } = process;
exports.config = {
    companyName: env.COMPANY_NAME,
    // AWS config
    aws: {
        region: env.AWS_REGION,
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        s3ACL: env.AWS_S3_ALC,
        bucketName: env.AWS_BUCKET_NAME
    },
    mailServie: {
        provider: env.MAIL_SERVICE_PROVIDER,
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
        sendGridApiKey: env.SENDGRID_API_KEY,
    }
};
//# sourceMappingURL=env.variable.js.map