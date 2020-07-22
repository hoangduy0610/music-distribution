import { Lable } from '../interfaces/LableInterface';

export class LableModal {
    id: string;
    owner: string;
    cover: string;
    name: string;
    active: boolean;
    createdAt: Date;
    createdBy: string;
    updatedAt: Date;
    updatedBy: string;
    isDeleted: boolean;
    bannedInfo: {
        reason: string,
        isWaiting: boolean,
        createdAt: Date,
    }
    constructor(lable: Lable) {
        this.id = lable._id;
        this.owner = lable.owner;
        this.cover = lable.cover;
        this.name = lable.name;
        this.active = lable.active;
        this.createdAt = lable.createdAt;
        this.createdBy = lable.createdBy;
        this.updatedAt = lable.updatedAt;
        this.updatedBy = lable.updatedBy;
        this.isDeleted = lable.isDeleted;
        this.bannedInfo = lable.bannedInfo;
    }

    public static fromLables(lables: Lable[]) {
        return lables.map(lable => new LableModal(lable));
    }

}
