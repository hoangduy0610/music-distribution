import { File } from '../interfaces/FileInterface';

export class FileModal {
    id: string;
    userForId: string;
    fileName: string;
    extension: string;
    type: string;
    internalPath: string;
    localPath: string;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    isDeleted: boolean;
    bannedInfo: {
        reason: string,
        isWaiting: boolean,
        createdAt: Date,
    }
    constructor(file: File) {
        this.id = file._id;
        this.userForId = file.userForId;
        this.fileName = file.fileName;
        this.extension = file.extension;
        this.type = file.type;
        this.internalPath = file.internalPath;
        this.localPath = file.localPath;
        this.createdAt = file.createdAt;
        this.createdBy = file.createdBy;
        this.updatedAt = file.updatedAt;
        this.updatedBy = file.updatedBy;
        this.isDeleted = file.isDeleted;
        this.bannedInfo = file.bannedInfo;
    }

    public static fromFiles(files: File[]) {
        return files.map(file => new FileModal(file));
    }

}
