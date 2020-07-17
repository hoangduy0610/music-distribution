import {Schema} from 'mongoose';
import {EnumRoles} from '../commons/EnumRoles';

export const UserSchema = new Schema({
    username: {type: String, require: true},
    fullName: {type: String, require: true},
    phone: {type: String, require: true},
    address: {type: String, require: true},
    age: {type: String, require: true},
    email: {type: String, require: true},
    active: {type: Boolean, required: false, default:false},
    bannedInfo: {
        type: [
            {
                reason: {type: String, required: false},
                isWaiting: {type: Boolean, required: false},
                createdAt: {type: Date, required: false},
            }], required: false
    },
    createdAt: {type: Date, require: true},
    createdBy: {type: String, require: true},
    updatedAt: {type: Date, require: false},
    updatedBy: {type: String, require: false},
    isDeleted: {type: Boolean, require: false, default: false},
    roles: [{type: String, require: false, enum: Object.keys(EnumRoles)}],
}, {timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});
