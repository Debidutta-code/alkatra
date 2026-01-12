import { ObjectCannedACL } from "@aws-sdk/client-s3";
import { SignOptions } from "jsonwebtoken"
import dotenv from "dotenv";
dotenv.config();

const { env } = process;

export const config = {

    server: {
        port: Number(env.PORT),
        host: env.HOST as string,
        mode: env.MODE as string,
        expressJsonLimit: env.EXPRESS_JSON_LIMIT as string,
        expressUrlencodedLimit: env.EXPRESS_URLENCODED_LIMIT as string,
        expressStaticPathFolder: env.EXPRESS_STATIC_FOLDER_PATH as string,
        expressUrlencodedExtended: Boolean(env.EXPRESS_URLENCODED_EXTENDED),
        morganMode: env.MORGAN_MODE as string,
        appName: env.APP_NAME as string,
        baseUrl: env.BASE_URL as string,
        deepLink: env.DEEP_LINK as string,
        timeZone: env.TIMEZONE as string,
        cors: {
            origins: env.CORS_ORIGINS.split(",") as string[],
            methods: env.CORS_METHODS.split(",") as string[],
            allowedHeaders: env.CORS_HEADERS.split(",") as string[],
            credentials: Boolean(env.CORS_CREDENTIALS),
        },
        jwt: {
            secretKey: env.JWT_SECRET_KEY as string,
            expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
            secretKeyDev: env.JWT_SECRET_KEY_DEV as string,
            expiresInDev: env.JWT_EXPIRES_IN_DEV as SignOptions['expiresIn']
        },
        reviewUrl: env.REVIEW_UI_URL as string
    },

    companyName: env.COMPANY_NAME as string,

    database: {
        mongoURI: env.EXTRANET_MONGO_URI_TESTING as string
    },

    // AWS config
    aws: {
        region: env.AWS_REGION as string,
        accessKeyId: env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY as string,
        s3ACL: env.AWS_S3_ALC as ObjectCannedACL,
        bucketName: env.AWS_BUCKET_NAME as string
    },

    mailServie: {
        provider: env.MAIL_SERVICE_PROVIDER as string,
        user: env.EMAIL_USER as string,
        pass: env.EMAIL_PASS as string,
        sendGridApiKey: env.SENDGRID_API_KEY as string,
    },

    // Referral System
    referralSystem: {
        referralLinkBaseUrl: env.REFERRAL_LINK_BASE_URL as string,
        referRewardAmount: Number(env.REFER_REWARD_AMOUNT),
    },

    taxSystem: {
        taxRulePrefix: env.TAX_RULE_PREFIX as string,
        taxGroupPrefix: env.TAX_GROUP_PREFIX as string
    },

    googleServie: {
        clientId: env.GOOGLE_CLIENT_ID as string,
        clientSecret: env.GOOGLE_CLIENT_SECRET as string,
        frontedCallbackUrl: env.GOOGLE_FRONTEND_CALLBACK_URL as string,
    },

    // PMS Integration
    pmsIntegration: {
        wincloudApiUrl: env.WINCLOUD_TEST_API as string,
        quotusPmsApiUrl: env.QUOTUS_PMS_API as string,
        quotusPmsToken: env.QUOTUS_PMS_TOKEN as string,
    }
    
}