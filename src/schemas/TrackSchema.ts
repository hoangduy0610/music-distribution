import { Schema } from 'mongoose';

const Artists = new Schema({
    username: { type: String, /*, enum: ['supplier', 'producer', 'transporter'] */ },
    role: { type: String },
}, { _id: false });

export const TrackSchema = new Schema({
    owner: { type: String, require: true },
    name: { type: String, require: true },
    trackOrder: { type: Number, require: true },
    trackId: { type: String, require: true },
    releaseId: { type: String, require: true },
    active: { type: Boolean, required: false, default: false },
    versionType: { type: String, require: true, enum: ['Remix', 'Original'] },
    explicit: { type: Boolean, require: true },
    ISRC: { type: String, require: true },
    artist: {
        type: [Artists],
        require: true
    },
    publisher: { type: String, require: true },
    language: { type: String, require: true },
    credit: { type: String, require: true },
    isOwner: { type: Boolean, require: true },
    isFirstRelease: { type: Boolean, require: true },
    isBundle: { type: Boolean, require: true },
    createdAt: { type: Date, require: true },
    createdBy: { type: String, require: true },
    updatedAt: { type: Date, require: false },
    updatedBy: { type: String, require: false },
    isDeleted: { type: Boolean, require: false, default: false },
    bannedInfo: {
        type:
        {
            reason: { type: String, required: false },
            isWaiting: { type: Boolean, required: false },
            createdAt: { type: Date, required: false },
        }, required: false
    },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export const DraftTrackSchema = new Schema({
    owner: { type: String, require: true },
    name: { type: String, require: false },
    trackOrder: { type: Number, require: false },
    trackId: { type: String, require: false },
    releaseId: { type: String, require: false },
    versionType: { type: String, require: false, enum: ['Remix', 'Original'] },
    explicit: { type: Boolean, require: false },
    ISRC: { type: String, require: false },
    artist: {
        type: [Artists],
        require: false
    },
    publisher: { type: String, require: false },
    language: { type: String, require: false },
    credit: { type: String, require: false },
    isOwner: { type: Boolean, require: false },
    isFirstRelease: { type: Boolean, require: false },
    isBundle: { type: Boolean, require: false },
    createdAt: { type: Date, require: true },
    createdBy: { type: String, require: false },
    updatedAt: { type: Date, require: false },
    updatedBy: { type: String, require: false },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });