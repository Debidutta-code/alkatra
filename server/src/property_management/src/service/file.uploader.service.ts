import { IStorageProvider, IFileUploader } from "../../../interfaces";
import path from "path";

export class FileUploader implements IFileUploader {
    private storageProvider: IStorageProvider;

    constructor(storageProvider: IStorageProvider) {
        this.storageProvider = storageProvider;
    }

    async uploadAndGetPublicUrl(localPath: string, fileName: string): Promise<string> {
        const key = `uploads/${Date.now()}_${fileName}`;
        return await this.storageProvider.upload(localPath, key);
    }
}
