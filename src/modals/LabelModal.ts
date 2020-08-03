import { Label } from '../interfaces/LabelInterface';

export class LabelModal {
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
    constructor(label: Label) {
        this.id = label._id;
        this.owner = label.owner;
        this.cover = label.cover;
        this.name = label.name;
        this.active = label.active;
        this.createdAt = label.createdAt;
        this.createdBy = label.createdBy;
        this.updatedAt = label.updatedAt;
        this.updatedBy = label.updatedBy;
        this.isDeleted = label.isDeleted;
        this.bannedInfo = label.bannedInfo;
    }

    public static fromLabels(labels: Label[]) {
        return labels.map(label => new LabelModal(label));
    }

}
