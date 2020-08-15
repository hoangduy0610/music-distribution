import { Schema } from 'mongoose';

export const LabelSchema = new Schema({
    owner: { type: String, require: true },
    cover: { type: String, require: true },
    name: { type: String, require: true },
    active: { type: Boolean, required: true, default: false },
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
