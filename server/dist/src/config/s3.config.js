"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const env_variable_1 = require("./env.variable");
const { region, accessKeyId, secretAccessKey } = env_variable_1.config.aws;
exports.s3Client = new client_s3_1.S3Client({
    region: region,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
    }
});
//# sourceMappingURL=s3.config.js.map