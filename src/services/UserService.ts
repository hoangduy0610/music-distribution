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
import { UserUpdateProfileDto } from '../dtos/UserUpdateProfileDto';

@Injectable()
export class UserService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
        private readonly userRepository: UserRepository,
        private readonly oAuthService: OAuthService,
    ) {
    }
    async findAll(isDeleted: string, active: string): Promise<UserModal[]> {
        return isDeleted
            ? (active
                ? await this.userRepository.findAll(isDeleted, active)
                : UserModal.fromUsers(await this.userModel.find({ isDeleted: isDeleted === 'true' }).exec()))
            : (active
                ? UserModal.fromUsers(await this.userModel.find({ active: active === 'true' }).exec())
                : UserModal.fromUsers(await this.userModel.find({}).exec()));
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

    async findArtistByUsername(username: string): Promise<UserModal> {
        var users = await this.userRepository.findByUsername(username);
        if (!users || !users.length) {
            throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.USER_NOT_REGISTER);
        }

        const user = users[0];
        if (user.isDeleted) {
            throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.USER_IS_DELETED);
        }
        return new UserModal(user);
    }

    async create(createdBy: string, userCreateDto: UserCreateDto): Promise<UserModal> {
        const user = await this.userModel.findOne({ username: userCreateDto.username }).exec();

        if (user) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.USER_ALREADY_EXISTED);
        }

        const response: any = await this.oAuthService.register(userCreateDto.username, userCreateDto.password);

        const responseData = await response.json();

        if (response.status === 200) {
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

        throw new ApplicationException(response.status, responseData.message || response.statusText || MessageCode.USER_CREATE_OAUTH_ERROR);
    }

    async register(userCreateDto: UserCreateDto): Promise<UserModal> {
        const user = await this.userModel.findOne({ username: userCreateDto.username }).exec();

        if (user) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.USER_ALREADY_EXISTED);
        }

        const response: any = await this.oAuthService.register(userCreateDto.username, userCreateDto.password);

        const responseData = await response.json();

        if (response.status === 200) {
            if (!responseData || !responseData.success) {
                throw new ApplicationException(HttpStatus.FORBIDDEN, responseData.message || MessageCode.USER_CREATE_OAUTH_ERROR);
            }
            const newUser = new this.userModel(userCreateDto);
            newUser.createdBy = userCreateDto.username;
            newUser.roles.push(EnumRoles.ROLE_USER);
            newUser.active = false;
            await newUser.save();
            return await this.findOneByUsername(newUser.username);
        }

        // Đăng ký không thành công
        throw new ApplicationException(response.status, responseData.message || response.statusText || MessageCode.USER_CREATE_OAUTH_ERROR);
    }

    async active(userId: string): Promise<UserModal> {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.USER_NOT_FOUND)
        }

        if (user.active == true) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.USER_ALREADY_BE_ACTIVE)
        }

        user.active = true;
        await user.save();
        return await this.findOneByUsername(user.username);
        //return await new this.userModel(user.save());
    }

    async updateProfile(username: string, updatedBy: string, userUpdateProfileDto: UserUpdateProfileDto): Promise<UserModal> {
        let updateRef = await this.userModel.findOne({ username: updatedBy }),
            reReq = updatedBy;

        if (updateRef.roles.includes(EnumRoles.ROLE_ADMIN)) {
            if (username) {
                updateRef = await this.userModel.findOne({ username });
                reReq = username;
            }
        }

        if (!updateRef) {
            throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.USER_NOT_FOUND)
        }
        if (updateRef.isDeleted) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.USER_IS_DELETED);
        }
        if (!updateRef.active) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.USER_NOT_ACTIVE);
        }

        if (userUpdateProfileDto.fullName) updateRef.fullName = userUpdateProfileDto.fullName;
        if (userUpdateProfileDto.phone) updateRef.phone = userUpdateProfileDto.phone;
        if (userUpdateProfileDto.address) updateRef.address = userUpdateProfileDto.address;
        if (userUpdateProfileDto.age) updateRef.age = userUpdateProfileDto.age;
        if (userUpdateProfileDto.email) updateRef.email = userUpdateProfileDto.email;
        updateRef.updatedBy = updatedBy;

        await updateRef.save();
        return await this.findOneByUsername(reReq);
    }

    async deleteProfile(username: string, updatedBy: string, reason: string): Promise<UserModal> {
        let deleteRef = await this.userModel.findOne({ username: updatedBy }),
            reReq = updatedBy;

        if (deleteRef.roles.includes(EnumRoles.ROLE_ADMIN)) {
            if (username) {
                deleteRef = await this.userModel.findOne({ username });
                reReq = username;
            } else {
                throw new ApplicationException(HttpStatus.NOT_ACCEPTABLE, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION)
            }
        }

        if (!deleteRef) {
            throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.USER_NOT_FOUND)
        }
        if (deleteRef.isDeleted) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.USER_IS_DELETED);
        }
        deleteRef.bannedInfo = [{ reason: '', isWaiting: false, createdAt: new Date() }]
        username === reReq ? deleteRef.isDeleted = true : deleteRef.bannedInfo[0].isWaiting = true;
        reason ? deleteRef.bannedInfo[0].reason = reason : deleteRef.bannedInfo[0].reason = 'NaN';
        deleteRef.updatedBy = updatedBy;


        return new UserModal(await deleteRef.save());
    }
}
