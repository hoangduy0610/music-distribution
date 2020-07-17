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
        ]);
    }

    async findByUsername(username: string): Promise<any> {
        return await this.userModel.aggregate([
            {
                $match: {
                    username,
                },
            },
        ]);
    }

    async findByUid(userId: string): Promise<any> {
        return await this.userModel.findById(userId).exec();
    }
}
