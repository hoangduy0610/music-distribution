import {Document} from 'mongoose';

export interface Label extends Document {
    _id: string;
    owner: string;
    cover: string;
    name: string;
    active: boolean;
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