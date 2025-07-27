import { S3Client } from "@aws-sdk/client-s3";
import { config } from "./env.variable";

const {
    region,
    accessKeyId,
    secretAccessKey
} = config.aws;

export const s3Client = new S3Client({
    region: region,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
    }
});