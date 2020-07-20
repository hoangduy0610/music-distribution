import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DraftRelease } from "../interfaces/ReleaseInterface";

@Injectable()
export class DraftReleaseRepository {
    constructor(
        @InjectModel('DraftRelease') private readonly draftReleaseModel: Model<DraftRelease>
    ) {
    }

    async findAll(isDeleted: string): Promise<any> {
        return await this.draftReleaseModel.aggregate([
            {
                $match: {
                    isDeleted: isDeleted === 'true', // Đã xóa hay chưa
                },
            },
        ]);
    }

    async findByOwner(isDeleted: string, owner: string) {
        return await this.draftReleaseModel.aggregate([
            {
                $match: {
                    isDeleted: isDeleted === 'true', // Đã xóa hay chưa
                    owner
                },
            },
        ]);
    }
}
