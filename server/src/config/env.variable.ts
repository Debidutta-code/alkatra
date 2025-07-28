import { ObjectCannedACL } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

const { env } = process;

export const config = {

    companyName: env.COMPANY_NAME as string,

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
    }

}