import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {User} from "../interfaces/UserInterface";

@Injectable()
export class UserRepository {
    constructor(@InjectModel('User') private readonly userModel: Model<User>) {
    }

    async findAll(isDeleted: string): Promise<any> {
        return await this.userModel.aggregate([
            {
                $match: {
                    isDeleted: isDeleted === 'true', // Đã xóa hay chưa
                },
            },
            {
                $lookup: {
                    from: 'products',
                    let: {
                        username: '$username',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$isDeleted', false],
                                        },
                                        {
                                            $eq: ['$owner', '$$username'],
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'products',
                },
            },
        ]);
    }

    async findByUsername(username: string): Promise<any> {
        return await this.userModel.aggregate([
            {
                $match: {
                    username,
                },
            },
            {
                $lookup: {
                    from: 'products',
                    let: {
                        username: '$username',
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$isDeleted', false],
                                        },
                                        {
                                            $eq: ['$owner', '$$username'],
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'products',
                },
            },
        ]);
    }


    async findEnterpriseWithBusinessActivityCodeOrUsername(code: string, username: string) {
        return await this.userModel.findOne({
            $or: [
                { 'enterprise.businessActivityCode': code },
                { username: username }
            ]
        }).exec()
    }
}
