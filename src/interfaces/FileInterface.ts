import {Document} from 'mongoose';

export interface File extends Document {
    _id: string;
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
}