import { Schema } from 'mongoose';

const Artists = new Schema({
    username: { type: String, required: true /*, enum: ['supplier', 'producer', 'transporter'] */ },
    role: { type: String, required: true, enum: ['performer', 'producer'] },
}, { _id: false });

export const ReleaseSchema = new Schema({
    owner: { type: String, require: true },
    title: { type: String, require: true },
    releaseId: { type: String, require: true },
    active: { type: Boolean, required: true, default: false },
    cover: { type: String, require: true },
    artist: {
        type: [Artists],
        require: true
    },
    lableId: { type: String, require: true },
    genre: { type: String, require: true },
    barcode: { type: String, require: false },
    credit: { type: String, require: true },
    countries: { type: String, require: true },
    shops: { type: String, require: true },
    description: { type: String, require: true },
    catalogNo: { type: String, require: true },
    status: { type: String, require: true, enum: ['Released', 'Pending'], default: 'Pending' },
    releaseAt: { type: Date, require: true },
    createdAt: { type: Date, require: true },
    createdBy: { type: String, require: true },
    updatedAt: { type: Date, require: false },
    updatedBy: { type: String, require: false },
    isDeleted: { type: Boolean, require: true, default: false },
    bannedInfo: {
        type:
        {
            reason: { type: String, required: false },
            isWaiting: { type: Boolean, required: false },
            createdAt: { type: Date, required: false },
        }, required: false, default: { reason: '', isWaiting: false, createdAt: new Date() }
    },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });

export const DraftReleaseSchema = new Schema({
    owner: { type: String, require: true },
    title: { type: String, require: false },
    releaseId: { type: String, require: false },
    cover: { type: String, require: false },
    artist: {
        type: [Artists],
        require: false
    },
    lableId: { type: String, require: false },
    genre: { type: String, require: false },
    barcode: { type: String, require: false },
    credit: { type: String, require: false },
    countries: { type: String, require: false },
    shops: { type: String, require: false },
    description: { type: String, require: false },
    catalogNo: { type: String, require: false },
    releaseAt: { type: Date, require: false },
    createdAt: { type: Date, require: true },
    createdBy: { type: String, require: false },
    updatedAt: { type: Date, require: false },
    updatedBy: { type: String, require: false },
}, { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } });