import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Release } from "../interfaces/ReleaseInterface";

@Injectable()
export class ReleaseRepository {
    constructor(
        @InjectModel('Release') private readonly releaseModel: Model<Release>,
    ) {
    }

    async findAll(isDeleted: string): Promise<any> {
        return await this.releaseModel.aggregate([
            {
                $match: {
                    isDeleted: isDeleted === 'true', // Đã xóa hay chưa
                },
            },
        ]);
    }

    async findByOwner(isDeleted: string, owner: string) {
        return await this.releaseModel.aggregate([
            {
                $match: {
                    isDeleted: isDeleted === 'true', // Đã xóa hay chưa
                    owner
                },
            },
        ]);
    }
}
