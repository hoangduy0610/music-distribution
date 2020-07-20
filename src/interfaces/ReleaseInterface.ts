import { Document } from 'mongoose';

export interface Artists {
    username: string,
    role: string
}

export interface Release extends Document {
    _id: string;
    owner: string;
    title: string;
    releaseId: string;
    active: boolean;
    cover: string;
    artist: Artists[],
    lableId: string;
    genre: string;
    barcode: string;
    credit: string;
    countries: string;
    shops: string;
    description: string;
    catalogNo: string;
    status: string;
    releaseAt: Date;
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

export interface DraftRelease extends Document {
    _id: string;
    owner: string;
    title: string;
    releaseId: string;
    cover: string;
    artist: Artists[],
    lableId: string;
    genre: string;
    barcode: string;
    credit: string;
    countries: string;
    shops: string;
    description: string;
    catalogNo: string;
    releaseAt: Date;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
}