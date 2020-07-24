import { HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationException } from '../controllers/ExceptionController';
import { MessageCode } from '../commons/MessageCode';
import { LableModal } from '../modals/LableModal';
import { LableRepository } from '../repositories/LableRepository';
import { EnumRoles } from '../commons/EnumRoles';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lable } from '../interfaces/LableInterface';
import { User } from '../interfaces/UserInterface';
import { LableCreateDto } from '../dtos/LableCreateDto';
import { LableUpdateDto } from '../dtos/LableUpdateDto';
import { BannedInfoDto } from '../dtos/BannedInfoDto';
import { FileStorageEnum } from 'src/commons/FileStorageEnum';
import { FileService } from './FileService';

@Injectable()
export class LableService {
    constructor(
        @InjectModel('Lable') private readonly lableModel: Model<Lable>,
        private readonly lableRepository: LableRepository,
        private readonly fileService: FileService,
    ) {
    }

    async findAll(isDeleted: string, user: User): Promise<LableModal[]> {
        const roles = user.roles,
            owner = user.username;
        if (roles.includes(EnumRoles.ROLE_ADMIN)) return isDeleted ? await this.lableRepository.findAll(isDeleted) : LableModal.fromLables(await this.lableModel.find({}).exec());
        else return isDeleted ? await this.lableRepository.findByOwner(isDeleted, owner) : LableModal.fromLables(await this.lableModel.find({ owner }).exec());
    }

    async find(id: string, user: User): Promise<LableModal> {
        const lable = await this.lableModel.findOne({ _id: id }),
            isAdmin = user.roles.includes(EnumRoles.ROLE_ADMIN);
        if (!lable) throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.LABLE_NOT_FOUND)
        if (lable.owner !== user.username && !isAdmin) throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION)

        return new LableModal(lable);
    }

    async create(user: User, lableCreateDto: LableCreateDto): Promise<LableModal> {
        const roles = user.roles,
            owner = user.username;
        if (!lableCreateDto) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.LABLE_NAME_IS_NULL)
        }
        const newLable = new this.lableModel(lableCreateDto);
        newLable.owner = owner;
        newLable.createdBy = owner;
        newLable.bannedInfo = { reason: '', isWaiting: false, createdAt: new Date() };
        if (roles.includes(EnumRoles.ROLE_ADMIN)) newLable.active = true;
        return new LableModal(await newLable.save());
    }

    async update(id: string, user: User, lableUpdateDto: LableUpdateDto): Promise<LableModal> {
        const roles = user.roles,
            owner = user.username,
            lable = await this.lableModel.findOne({ _id: id });
        if (!lableUpdateDto) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.LABLE_NAME_IS_NULL)
        }
        if (lableUpdateDto.active)
            if (roles.includes(EnumRoles.ROLE_ADMIN)) lable.active = lableUpdateDto.active;
            else throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION)
        else lable.active = false;
        if (lableUpdateDto.name) lable.name = lableUpdateDto.name;
        if (lableUpdateDto.owner)
            if (roles.includes(EnumRoles.ROLE_ADMIN)) lable.owner = lableUpdateDto.owner;
            else throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION)

        lable.updatedBy = owner;

        return new LableModal(await lable.save());
    }

    async delete(id: string, user: User, bannedInfoDto: BannedInfoDto): Promise<LableModal> {
        const deleteRef = await this.lableModel.findOne({ _id: id }).exec(),
            roles = user.roles,
            username = user.username;

        if (!deleteRef) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.LABLE_NOT_FOUND)
        }

        if (deleteRef.isDeleted) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.LABLE_IS_DELETED)
        }

        if (!bannedInfoDto.reason) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.BANNED_INFO_IS_NULL)
        }

        if (!roles.includes(EnumRoles.ROLE_ADMIN)) {
            if (deleteRef.owner !== username) {
                throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION)
            }

            if (deleteRef.bannedInfo.isWaiting) {
                throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.LABLE_IS_WAITING)
            }

            deleteRef.bannedInfo.isWaiting = true;
        }

        if (deleteRef.cover && deleteRef.cover !== "") await this.deleteCover(id, user);

        deleteRef.bannedInfo.reason = bannedInfoDto.reason;
        deleteRef.bannedInfo.createdAt = new Date();

        if (roles.includes(EnumRoles.ROLE_ADMIN)) {
            deleteRef.isDeleted = true;
            deleteRef.bannedInfo.isWaiting = false;
        }

        deleteRef.updatedBy = user.username;

        return new LableModal(await deleteRef.save());
    }

    async uploadCover(id: string, user: User, files: any): Promise<LableModal> {
        const lable = await this.lableModel.findOne({ _id: id }),
            isAdmin = user.roles.includes(EnumRoles.ROLE_ADMIN);
        if (!lable) throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.LABLE_NOT_FOUND)
        if (lable.owner !== user.username && !isAdmin) throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION)

        if (!files || files.empty) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.FILE_NOT_FOUND)
        }
        const uploaded: String[] = [];
        files.forEach(file => {
            uploaded.push(file.originalname)
        });

        const upload = await this.fileService.saveFiles(user, uploaded, FileStorageEnum.IMAGES, id);
        if (!upload || !upload.status) throw new ApplicationException(HttpStatus.SERVICE_UNAVAILABLE, MessageCode.FILE_CANNOT_UPLOAD)

        lable.cover = upload.msg[0].internalPath;

        return new LableModal(await lable.save())
    }

    async deleteCover(id: string, user: User): Promise<LableModal> {
        const lable = await this.lableModel.findOne({ _id: id }),
            isAdmin = user.roles.includes(EnumRoles.ROLE_ADMIN);
        if (!lable) throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.LABLE_NOT_FOUND)
        if (lable.owner !== user.username && !isAdmin) throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION)

        await this.fileService.delete(id, { reason: 'Delete cover' });
        lable.cover = "";

        return new LableModal(await lable.save())
    }
}
