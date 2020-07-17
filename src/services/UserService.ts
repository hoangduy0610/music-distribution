import { HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationException } from '../controllers/ExceptionController';
import { MessageCode } from '../commons/MessageCode';
import { UserModal } from '../modals/UserModal';
import { UserRepository } from '../repositories/UserRepository';
import { EnumRoles } from '../commons/EnumRoles';
import { UserCreateDto } from '../dtos/UserCreateDto';
import { OAuthService } from './OAuthService';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../interfaces/UserInterface';

@Injectable()
export class UserService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
        private readonly userRepository: UserRepository,
        private readonly oAuthService: OAuthService,
    ) {
    }
    async findAll(isDeleted: string): Promise<UserModal[]> {
        return await this.userRepository.findAll(isDeleted);
    }

    async findOneByUsername(username: string): Promise<UserModal> {
        const users = await this.userRepository.findByUsername(username);
        if (!users || !users.length) {
            throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.USER_NOT_REGISTER);
        }

        const user = users[0];
        if (user.isDeleted) {
            throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.USER_IS_DELETED);
        }
        return new UserModal(user);
    }

    async findOneByUid(userId: string, username: string): Promise<UserModal> {
        const userReq = await this.userRepository.findByUsername(username);
        if (userReq[0].roles.includes(EnumRoles.ROLE_ADMIN)) {
            if (!userId) {
                return new UserModal(userReq[0]);
            }
            const findUser = await this.userRepository.findByUid(userId);
            if (!findUser) {
                throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.USER_NOT_FOUND)
            }
            return new UserModal(findUser);
        }
    }

    /**
     * @param createdBy: Người tạo (Admin)
     * @param userCreateDto: Thông tin người dùng cần tạo
     */
    async create(createdBy: string, userCreateDto: UserCreateDto): Promise<UserModal> {
        const user = await this.userModel.findOne({ username: userCreateDto.username }).exec();

        // Kiểm tra sự tồn tại của user
        if (user) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.USER_ALREADY_EXISTED);
        }

        // Gọi đăng ký sang OAuth
        const response: any = await this.oAuthService.register(userCreateDto.username, userCreateDto.password);

        const responseData = await response.json();

        // Đăng ký thành công
        if (response.status === 200) {

            // Không lấy được userId - Đăng ký lỗi
            if (!responseData || !responseData.success) {
                throw new ApplicationException(HttpStatus.FORBIDDEN, responseData.message || MessageCode.USER_CREATE_OAUTH_ERROR);
            }
            const newUser = new this.userModel(userCreateDto);
            newUser.createdBy = createdBy;
            newUser.roles.push(EnumRoles.ROLE_USER);
            newUser.active = true;
            await newUser.save();
            return await this.findOneByUsername(newUser.username);
        }

        // Đăng ký không thành công
        throw new ApplicationException(response.status, responseData.message || response.statusText || MessageCode.USER_CREATE_OAUTH_ERROR);
    }
}
