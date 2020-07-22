import {Document} from 'mongoose';

export interface Artists {
    username: string,
    role: string
}

export interface Track extends Document {
    _id: string;
    owner: string;
    name: string;
    trackOrder:number;
    trackId: string;
    releaseId: string;
    active: boolean;
    versionType: string;
    explicit: boolean;
    ISRC: string;
    artist: Artists[],
    publisher: string;
    language: string;
    credit: string;
    isOwner:Boolean;
    isBundle: Boolean;
    isFirstRelease: Boolean;
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

export interface DraftTrack extends Document {
    _id: string;
    owner: string;
    name: string;
    trackOrder:number;
    trackId: string;
    releaseId: string;
    versionType: string;
    explicit: boolean;
    ISRC: string;
    artist: Artists[],
    publisher: string;
    language: string;
    credit: string;
    isOwner:Boolean;
    isBundle: Boolean;
    isFirstRelease: Boolean;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
}