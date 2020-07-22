import { Schema } from 'mongoose';

export const LableSchema = new Schema({
    owner: { type: String, require: true },
    cover: { type: String, require: true },
    name: { type: String, require: true },
    active: { type: Boolean, required: false, default: false },
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
