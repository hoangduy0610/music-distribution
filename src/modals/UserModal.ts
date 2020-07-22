import { User } from '../interfaces/UserInterface';

export class UserModal {
    id: string;
    username: string;
    fullName: string;
    createdAt: Date;
    userId: string;
    active: boolean;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    address: string;
    age: string;
    email: string;
    roles: string[];
    phone: string;
    avatar: string;
    isDeleted: boolean;
    bannedInfo: [{
        reason: string,
        isWaiting: boolean,
        createdAt: Date,
    }];
    constructor(user: User) {
        this.id = user._id;
        this.username = user.username;
        this.fullName = user.fullName;
        this.phone = user.phone;
        this.createdAt = user.createdAt;
        this.createdBy = user.createdBy;
        this.updatedAt = user.updatedAt;
        this.updatedBy = user.updatedBy;
        this.address = user.address;
        this.active = user.active;
        this.roles = user.roles;
        this.age = user.age;
        this.email = user.email;
        this.avatar = user.avatar;
        this.isDeleted = user.isDeleted;
        this.bannedInfo = user.bannedInfo;
    }

    public static fromUsers(users: User[]) {
        return users.map(user => new UserModal(user));
    }

}
