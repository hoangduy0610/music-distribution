import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lable } from "../interfaces/LableInterface";

@Injectable()
export class LableRepository {
    constructor(
        @InjectModel('Lable') private readonly lableModel: Model<Lable>) {
    }

    async findAll(isDeleted: string): Promise<any> {
        return await this.lableModel.aggregate([
            {
                $match: {
                    isDeleted: isDeleted === 'true', // Đã xóa hay chưa
                },
            },
        ]);
    }

    async findByOwner(isDeleted: string, owner: string) {
        return await this.lableModel.aggregate([
            {
                $match: {
                    isDeleted: isDeleted === 'true', // Đã xóa hay chưa
                    owner
                },
            },
        ]);
    }
}
