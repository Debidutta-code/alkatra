import { IStorageProvider } from "../../../interfaces";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, config } from "../../../config";
import fs from "fs";
import mime from "mime-types";

const {
    region,
    s3ACL
} = config.aws

export class S3FileUploadService implements IStorageProvider {

    private readonly bucketName: string;
    
    constructor(bucketName: string) {
        this.bucketName = bucketName;
    } 

    async upload(filePath: string, key: string): Promise<string> {
        const fileStream = fs.createReadStream(filePath);
        const lookupResult = mime.lookup(filePath);
        const contentType: string | undefined = typeof lookupResult === "string" ? lookupResult : undefined;

        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: fileStream,
            ACL: s3ACL,
            ContentType: contentType
        });

        await s3Client.send(command);

        return `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;
    }
}