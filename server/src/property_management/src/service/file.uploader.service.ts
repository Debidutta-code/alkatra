import { IStorageProvider, IFileUploader } from "../../../interfaces";
import fs from "fs/promises";

export class FileUploader implements IFileUploader {
    private readonly storageProvider: IStorageProvider;

    constructor(storageProvider: IStorageProvider) {
        this.storageProvider = storageProvider;
    }

    async uploadFiles(files: any, destinationFolder: string) {
        const uploads = await Promise.all(
            files.map(async (file: any) => {
                const key = `${destinationFolder}/${Date.now()}_${file.originalname}`;
                const url = await this.storageProvider.upload(file.path, key);

                // Clean up local file after successful upload
                await fs.unlink(file.path);

                return url;
            })
        )

        return uploads;
    }
}
