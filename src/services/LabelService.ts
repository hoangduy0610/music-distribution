import { HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationException } from '../controllers/ExceptionController';
import { MessageCode } from '../commons/MessageCode';
import { LabelModal } from '../modals/LabelModal';
import { LabelRepository } from '../repositories/LabelRepository';
import { EnumRoles } from '../commons/EnumRoles';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Label } from '../interfaces/LabelInterface';
import { User } from '../interfaces/UserInterface';
import { LabelCreateDto } from '../dtos/LabelCreateDto';
import { LabelUpdateDto } from '../dtos/LabelUpdateDto';
import { BannedInfoDto } from '../dtos/BannedInfoDto';
import { FileStorageEnum } from '../commons/FileStorageEnum';
import { FileService } from './FileService';

@Injectable()
export class LabelService {
    constructor(
        @InjectModel('Label') private readonly labelModel: Model<Label>,
        private readonly labelRepository: LabelRepository,
        private readonly fileService: FileService,
    ) {
    }

    async findAll(isDeleted: string, user: User): Promise<LabelModal[]> {
        const roles = user.roles,
            owner = user.username;
        if (roles.includes(EnumRoles.ROLE_ADMIN)) return isDeleted ? await this.labelRepository.findAll(isDeleted) : LabelModal.fromLabels(await this.labelModel.find({}).exec());
        else return isDeleted ? await this.labelRepository.findByOwner(isDeleted, owner) : LabelModal.fromLabels(await this.labelModel.find({ owner }).exec());
    }

    async find(id: string, user: User): Promise<LabelModal> {
        const label = await this.labelModel.findOne({ _id: id }),
            isAdmin = user.roles.includes(EnumRoles.ROLE_ADMIN);
        if (!label) throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.LABEL_NOT_FOUND)
        if (label.owner !== user.username && !isAdmin) throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION)

        return new LabelModal(label);
    }

    async create(user: User, labelCreateDto: LabelCreateDto): Promise<LabelModal> {
        const roles = user.roles,
            owner = user.username;
        if (!labelCreateDto) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.LABEL_NAME_IS_NULL)
        }
        const newLabel = new this.labelModel(labelCreateDto);
        newLabel.owner = owner;
        newLabel.createdBy = owner;
        newLabel.bannedInfo = { reason: '', isWaiting: false, createdAt: new Date() };
        if (roles.includes(EnumRoles.ROLE_ADMIN)) newLabel.active = true;
        return new LabelModal(await newLabel.save());
    }

    async update(id: string, user: User, labelUpdateDto: LabelUpdateDto): Promise<LabelModal> {
        const roles = user.roles,
            owner = user.username,
            label = await this.labelModel.findOne({ _id: id });
        if (!labelUpdateDto) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.LABEL_NAME_IS_NULL)
        }
        if (labelUpdateDto.active)
            if (roles.includes(EnumRoles.ROLE_ADMIN)) label.active = labelUpdateDto.active;
            else throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION)
        else label.active = false;
        if (labelUpdateDto.name) label.name = labelUpdateDto.name;
        if (labelUpdateDto.owner)
            if (roles.includes(EnumRoles.ROLE_ADMIN)) label.owner = labelUpdateDto.owner;
            else throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION)

        label.updatedBy = owner;

        return new LabelModal(await label.save());
    }

    async delete(id: string, user: User, bannedInfoDto: BannedInfoDto): Promise<LabelModal> {
        const deleteRef = await this.labelModel.findOne({ _id: id }).exec(),
            roles = user.roles,
            username = user.username;

        if (!deleteRef) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.LABEL_NOT_FOUND)
        }

        if (deleteRef.isDeleted) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.LABEL_IS_DELETED)
        }

        if (!bannedInfoDto.reason) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.BANNED_INFO_IS_NULL)
        }

        if (!roles.includes(EnumRoles.ROLE_ADMIN)) {
            if (deleteRef.owner !== username) {
                throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION)
            }

            if (deleteRef.bannedInfo.isWaiting) {
                throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.LABEL_IS_WAITING)
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

        return new LabelModal(await deleteRef.save());
    }

    async uploadCover(id: string, user: User, files: any): Promise<LabelModal> {
        const label = await this.labelModel.findOne({ _id: id }),
            isAdmin = user.roles.includes(EnumRoles.ROLE_ADMIN);
        if (!label) throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.LABEL_NOT_FOUND)
        if (label.owner !== user.username && !isAdmin) throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION)

        if (!files || files.empty) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.FILE_NOT_FOUND)
        }
        const uploaded: String[] = [];
        files.forEach(file => {
            uploaded.push(file.originalname)
        });

        const upload = await this.fileService.saveFiles(user, uploaded, FileStorageEnum.IMAGES, id);
        if (!upload || !upload.status) throw new ApplicationException(HttpStatus.SERVICE_UNAVAILABLE, MessageCode.FILE_CANNOT_UPLOAD)

        label.cover = upload.msg[0].internalPath;

        return new LabelModal(await label.save())
    }

    async deleteCover(id: string, user: User): Promise<LabelModal> {
        const label = await this.labelModel.findOne({ _id: id }),
            isAdmin = user.roles.includes(EnumRoles.ROLE_ADMIN);
        if (!label) throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.LABEL_NOT_FOUND)
        if (label.owner !== user.username && !isAdmin) throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION)

        await this.fileService.delete(id, { reason: 'Delete cover' });
        label.cover = "";

        return new LabelModal(await label.save())
    }
}
