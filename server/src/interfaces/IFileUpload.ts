
export interface IStorageProvider {
    upload(filePath: string, key: string): Promise<string>;
}


export interface IFileUploader {
    uploadAndGetPublicUrl(localPath: string, fileName: string): Promise<string>;
}
