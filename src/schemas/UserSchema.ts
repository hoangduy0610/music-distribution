import {Schema} from 'mongoose';
import {EnumRoles} from '../commons/EnumRoles';

export const UserSchema = new Schema({
    userId: {type: String, require: true},
    username: {type: String, require: true},
    fullName: {type: String, require: true},
    phone: {type: String, require: true},
    address: {type: String, require: true},
    active: {type: Boolean, required: false},
    enterprise: {
        type: {
            enterpriseName: {type: String, required: true},
            businessActivityCode: {type: String, required: true},
            taxIdentificationNumber: {type: String, required: false},
            industry: {type: String, required: true},
            address: {type: String, require: true},
            city: {type: String, require: true},
            certifications: {type: [String], required: false},
            updatedAt: {type: Date, required: false}
        }, required: false
    },
    bannedInfo: {
        type: [
            {
                id: {type: String, required: false},
                text: {type: String, required: false},
                createdAt: {type: Date, required: false},
            }], required: false
    },
    retailer: {type: Object, required: false},
    createdAt: {type: Date, require: true},
    createdBy: {type: String, require: true},
    updatedAt: {type: Date, require: false},
    updatedBy: {type: String, require: false},
    isDeleted: {type: Boolean, require: false, default: false},
    roles: [{type: String, require: false, enum: Object.keys(EnumRoles)}],
    zipCode: {type: String, required: false}
}, {timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}});
