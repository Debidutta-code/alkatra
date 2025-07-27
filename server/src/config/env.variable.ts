import { ObjectCannedACL } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

const { env } = process;

export const config = {

    // AWS config
    aws: {
        region: env.AWS_REGION as string,
        accessKeyId: env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY as string,
        s3ACL: env.AWS_S3_ALC as ObjectCannedACL,
    }

}