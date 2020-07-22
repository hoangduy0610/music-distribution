import {Document} from 'mongoose';

export interface User extends Document {
    _id: string;
    username: string;
    fullName: string;
    phone: string;
    age: string;
    email: string;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    address: string;
    roles: string[];
    active: boolean;
    bannedInfo: [{
        reason: string,
        isWaiting: boolean,
        createdAt: Date,
    }]
    isDeleted: boolean;
    avatar:string;
}
