import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Label } from "../interfaces/LabelInterface";

@Injectable()
export class LabelRepository {
    constructor(
        @InjectModel('Label') private readonly labelModel: Model<Label>
    ) {
    }

    async findAll(isDeleted: string): Promise<any[]> {
        return await this.labelModel.aggregate([
            {
                $match: {
                    isDeleted: isDeleted === 'true', // Đã xóa hay chưa
                },
            },
        ]);
    }

    async findByOwner(isDeleted: string, owner: string): Promise<any[]> {
        return await this.labelModel.aggregate([
            {
                $match: {
                    isDeleted: isDeleted === 'true', // Đã xóa hay chưa
                    owner
                },
            },
        ]);
    }
}
