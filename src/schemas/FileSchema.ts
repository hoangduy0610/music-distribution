import { Schema } from 'mongoose';

export const FileSchema = new Schema({
    useForId: { type: String, require: true },
    fileName: { type: String, require: true },
    extension: { type: String, require: true },
    type: { type: String, require: true, enum: ['image', 'track'] },
    internalPath: { type: String, require: true },
    localPath: { type: String, require: true },
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