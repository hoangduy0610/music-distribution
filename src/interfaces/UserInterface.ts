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
    active: boolean,
    bannedInfo: [{
        banId: string,
        text: string,
        createdAt: string,
    }]
    isDeleted: boolean;
    avatar:string;
}
