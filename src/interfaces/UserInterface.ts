import {Document} from 'mongoose';

export interface User extends Document {
    _id: string;
    userId: string;
    username: string;
    fullName: string;
    phone: string;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    address: string;
    roles: string[];
    active: boolean,
    enterprise: {
        enterpriseName: string,
        businessActivityCode: string,
        taxIdentificationNumber: string,
        industry: string,
        address: string,
        city: string,
        certifications: string[],
        updatedAt: Date,
    },
    bannedInfo: [{
        banId: string,
        text: string,
        createdAt: string,
    }]
    retailer: Object,
    zipCode: string,
    isDeleted: boolean;
    avatar:string;
}
