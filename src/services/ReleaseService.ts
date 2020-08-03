import { HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationException } from '../controllers/ExceptionController';
import { MessageCode } from '../commons/MessageCode';
import { ReleaseModal, DraftReleaseModal } from '../modals/ReleaseModal';
import { ReleaseRepository } from '../repositories/ReleaseRepository';
import { EnumRoles } from '../commons/EnumRoles';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Release, DraftRelease } from '../interfaces/ReleaseInterface';
import { User } from '../interfaces/UserInterface';
import { DraftReleaseRepository } from '../repositories/DraftReleaseRepository';
import { ReleaseUpdateDto } from '../dtos/ReleaseUpdateDto';
import { BannedInfoDto } from '../dtos/BannedInfoDto';
import { TrackService } from './TrackService';
import { TrackModal, DraftTrackModal } from '../modals/TrackModal';
import { DraftReleaseUpdateDto } from '../dtos/DraftReleaseUpdateDto';
import { IdUtil } from '../utils/IdUtil';
import { FileService } from './FileService';
import { FileStorageEnum } from '../commons/FileStorageEnum';
import { UserService } from './UserService';

@Injectable()
export class ReleaseService {
    constructor(
        @InjectModel('Release') private readonly releaseModel: Model<Release>,
        @InjectModel('DraftRelease') private readonly draftReleaseModel: Model<DraftRelease>,
        private readonly releaseRepository: ReleaseRepository,
        private readonly draftReleaseRepository: DraftReleaseRepository,
        private readonly trackService: TrackService,
        private readonly fileService: FileService,
        private readonly userService: UserService,
    ) {
    }

    async findAll(isDeleted: string, active: string, user: User): Promise<ReleaseModal[]> {
        const roles = user.roles,
            owner = user.username;
        if (roles.includes(EnumRoles.ROLE_ADMIN))
            if (isDeleted && active)
                return await this.releaseRepository.findAll(isDeleted, active)
            else if (active)
                return ReleaseModal.fromReleases(await this.releaseModel.find({ active: active === 'true' }).exec());
            else if (isDeleted)
                return ReleaseModal.fromReleases(await this.releaseModel.find({ isDeleted: isDeleted === 'true' }).exec());
            else
                return ReleaseModal.fromReleases(await this.releaseModel.find({}).exec());

        else
            if (isDeleted)
                return await this.releaseRepository.findByOwner(isDeleted, active, owner)
            else if (active)
                return ReleaseModal.fromReleases(await this.releaseModel.find({ owner, active: active === 'true' }).exec());
            else if (isDeleted)
                return ReleaseModal.fromReleases(await this.releaseModel.find({ owner, isDeleted: isDeleted === 'true' }).exec());
            else
                return ReleaseModal.fromReleases(await this.releaseModel.find({ owner }).exec());
    }

    async findAllDraft(user: User): Promise<DraftReleaseModal[]> {
        const roles = user.roles,
            owner = user.username;
        if (roles.includes(EnumRoles.ROLE_ADMIN)) return DraftReleaseModal.fromReleases(await this.draftReleaseModel.find({}).exec());
        else return DraftReleaseModal.fromReleases(await this.draftReleaseModel.find({ owner }).exec());
    }

    async findOneByReleaseId(releaseId: string, user: User): Promise<ReleaseModal> {
        const release = await this.releaseModel.findOne({ releaseId });

        if (!releaseId || !release) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.RELEASE_NOT_FOUND);
        }

        if (!user.roles.includes(EnumRoles.ROLE_ADMIN)) {
            if (release.owner !== user.username) {
                throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION)
            }
        }

        return new ReleaseModal(release);
    }

    async findArtists(releaseId: string): Promise<any> {
        const release = await this.releaseModel.findOne({ releaseId });
        if (!release) {
            throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.RELEASE_NOT_FOUND);
        }
        if (release.isDeleted) {
            throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.RELEASE_IS_DELETED);
        }

        var userInfomation: any[] = [];
        const info = release.artist;

        for (let i = 0; i < info.length; i++) {
            const data = info[i];
            let user = await this.userService.findArtistByUsername(data.username);
            userInfomation.push({ name: user.fullName, role: data.role });
            //userInfomation[i].user = user;
        }
        return userInfomation;
    }

    async update(releaseId: string, user: User, releaseUpdateDto: ReleaseUpdateDto): Promise<ReleaseModal> {
        // Kiểm tra input
        if (!releaseUpdateDto) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.RELEASE_CONTENT_IS_NULL);
        }

        if (!user) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.USER_NOT_FOUND);
        }

        const releaseUpdate = await this.releaseModel.findOne({ releaseId });

        if (!user.roles.includes(EnumRoles.ROLE_ADMIN)) {
            if (user.username !== releaseUpdate.owner) {
                throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION);
            }
        }

        if (!releaseUpdate) {
            throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.RELEASE_NOT_FOUND)
        }
        if (releaseUpdate.isDeleted) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.RELEASE_IS_DELETED);
        }

        if (releaseUpdateDto.artist && releaseUpdateDto.artist.length) releaseUpdate.artist = releaseUpdateDto.artist;
        if (releaseUpdateDto.barcode) releaseUpdate.barcode = releaseUpdateDto.barcode;
        if (releaseUpdateDto.countries) releaseUpdate.countries = releaseUpdateDto.countries;
        if (releaseUpdateDto.credit) releaseUpdate.credit = releaseUpdateDto.credit;
        if (releaseUpdateDto.description) releaseUpdate.description = releaseUpdateDto.description;
        if (releaseUpdateDto.genre) releaseUpdate.genre = releaseUpdateDto.genre;
        if (releaseUpdateDto.labelId) releaseUpdate.labelId = releaseUpdateDto.labelId;
        if (releaseUpdateDto.releaseAt) releaseUpdate.releaseAt = releaseUpdateDto.releaseAt;
        if (releaseUpdateDto.shops) releaseUpdate.shops = releaseUpdateDto.shops;
        if (releaseUpdateDto.title) releaseUpdate.title = releaseUpdateDto.title;
        releaseUpdate.updatedBy = user.username;

        return new ReleaseModal(await releaseUpdate.save());
    }

    async active(releaseId: string, updatedBy: string): Promise<ReleaseModal> {
        const release = await this.releaseModel.findOne({ releaseId }).exec();
        release.active = true;
        release.updatedBy = updatedBy;
        return new ReleaseModal(await release.save());
    }

    async released(releaseId: string, updatedBy: string): Promise<ReleaseModal> {
        const release = await this.releaseModel.findOne({ releaseId }).exec();
        release.status = 'Released';
        release.updatedBy = updatedBy;
        return new ReleaseModal(await release.save());
    }

    async delete(releaseId: string, user: User, bannedInfoDto: BannedInfoDto): Promise<ReleaseModal> {
        const deleteRef = await this.releaseModel.findOne({ releaseId }).exec(),
            roles = user.roles,
            username = user.username;

        if (!deleteRef) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.RELEASE_NOT_FOUND)
        }

        if (deleteRef.isDeleted) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.RELEASE_IS_DELETED)
        }

        if (!bannedInfoDto.reason) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.BANNED_INFO_IS_NULL)
        }

        if (!roles.includes(EnumRoles.ROLE_ADMIN)) {
            if (deleteRef.owner !== username) {
                throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION)
            }

            if (deleteRef.bannedInfo.isWaiting) {
                throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.RELEASE_IS_WAITING)
            }

            deleteRef.bannedInfo.isWaiting = true;
        }

        if (deleteRef.cover && deleteRef.cover !== "") await this.deleteCover(releaseId, user);

        deleteRef.bannedInfo.reason = bannedInfoDto.reason;
        deleteRef.bannedInfo.createdAt = new Date();

        if (roles.includes(EnumRoles.ROLE_ADMIN)) {
            deleteRef.isDeleted = true;
            deleteRef.bannedInfo.isWaiting = false;
        }
        deleteRef.updatedBy = user.username;
        await this.trackService.deleteTracksByReleaseId(releaseId, bannedInfoDto, user);

        return new ReleaseModal(await deleteRef.save());
    }

    async findAllTrack(releaseId: string, user: User): Promise<TrackModal[]> {
        const release: Release = await this.releaseModel.findOne({ releaseId }).exec();
        if (!release) {
            throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.RELEASE_NOT_FOUND);
        }
        const isAdmin = user.roles && user.roles.includes(EnumRoles.ROLE_ADMIN);

        if (release.owner !== user.username && !isAdmin) {
            throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION);
        }
        return await this.trackService.findAllByReleaseId(releaseId);
    }

    async findAllTrackDraft(releaseId: string, user: User): Promise<DraftTrackModal[]> {
        const release: DraftRelease = await this.draftReleaseModel.findOne({ releaseId }).exec();
        if (!release) {
            throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.RELEASE_NOT_FOUND);
        }
        const isAdmin = user.roles && user.roles.includes(EnumRoles.ROLE_ADMIN);

        if (release.owner !== user.username && !isAdmin) {
            throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION);
        }
        return await this.trackService.findAllByReleaseId(releaseId);
    }

    async createDraft(releaseId: string, user: User, releaseUpdateDto: DraftReleaseUpdateDto): Promise<DraftReleaseModal> {
        const releaseUpdate = await this.releaseModel.findOne({ releaseId });
        if (releaseUpdate) throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.RELEASE_IS_CREATED)
        const news = new this.draftReleaseModel(releaseUpdateDto);
        news.createdAt = new Date();
        news.releaseId = releaseId;
        news.owner = user.username;
        news.createdBy = user.username;

        return new DraftReleaseModal(await news.save());
    }

    async updateDraft(releaseId: string, user: User, releaseUpdateDto: DraftReleaseUpdateDto): Promise<DraftReleaseModal> {
        if (!releaseId) {
            return await this.createDraft(IdUtil.generateId(15), user, releaseUpdateDto);
        }
        let releaseUpdate: DraftRelease = await this.draftReleaseModel.findOne({ releaseId }).exec();
        const isAdmin = user.roles && user.roles.includes(EnumRoles.ROLE_ADMIN);

        if (releaseUpdate.owner && releaseUpdate.owner !== '' && releaseUpdate.owner !== user.username && !isAdmin) {
            throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION);
        }
        if (releaseUpdateDto.artist && releaseUpdateDto.artist.length) releaseUpdate.artist = releaseUpdateDto.artist;
        if (releaseUpdateDto.barcode) releaseUpdate.barcode = releaseUpdateDto.barcode;
        if (releaseUpdateDto.countries) releaseUpdate.countries = releaseUpdateDto.countries;
        if (releaseUpdateDto.credit) releaseUpdate.credit = releaseUpdateDto.credit;
        if (releaseUpdateDto.description) releaseUpdate.description = releaseUpdateDto.description;
        if (releaseUpdateDto.genre) releaseUpdate.genre = releaseUpdateDto.genre;
        if (releaseUpdateDto.labelId) releaseUpdate.labelId = releaseUpdateDto.labelId;
        if (releaseUpdateDto.releaseAt) releaseUpdate.releaseAt = releaseUpdateDto.releaseAt;
        if (releaseUpdateDto.shops) releaseUpdate.shops = releaseUpdateDto.shops;
        if (releaseUpdateDto.title) releaseUpdate.title = releaseUpdateDto.title;
        if (releaseUpdateDto.catalogNo) releaseUpdate.catalogNo = releaseUpdateDto.catalogNo;
        releaseUpdate.updatedBy = user.username;

        return new DraftReleaseModal(await releaseUpdate.save());
    }

    async deleteDraft(releaseId: string, user: User) {
        const deleteRef = await this.draftReleaseModel.findOne({ releaseId }).exec(),
            roles = user.roles,
            username = user.username;

        if (!deleteRef) {
            throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.RELEASE_NOT_FOUND)
        }

        if (!roles.includes(EnumRoles.ROLE_ADMIN)) {
            if (deleteRef.owner !== username) {
                throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION)
            }
        }

        if (deleteRef.cover && deleteRef.cover !== "") await this.deleteCover(releaseId, user);

        const res = await this.draftReleaseModel.deleteOne({ releaseId });
        await this.trackService.deleteTracksByReleaseId(releaseId, { reason: "Draft" }, user);
        if (res.deletedCount) return { statusCode: 200, msg: "Deleted" }

        throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.RELEASE_NOT_FOUND)
    }

    async create(releaseId: string, user: User): Promise<ReleaseModal> {
        const release = await this.draftReleaseModel.findOne({ releaseId }),
            isAdmin = user.roles.includes(EnumRoles.ROLE_ADMIN);
        if (!release) throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.RELEASE_NOT_FOUND)
        if (release.owner !== user.username && !isAdmin) throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION)
        const news = new this.releaseModel();
        if (release.releaseId) news.releaseId = release.releaseId;
        if (release.owner) news.owner = release.owner;
        if (release.cover) news.cover = release.cover;
        if (release.artist && release.artist.length) news.artist = release.artist;
        if (release.barcode) news.barcode = release.barcode;
        if (release.countries) news.countries = release.countries;
        if (release.credit) news.credit = release.credit;
        if (release.description) news.description = release.description;
        if (release.genre) news.genre = release.genre;
        if (release.labelId) news.labelId = release.labelId;
        if (release.releaseAt) news.releaseAt = release.releaseAt;
        if (release.shops) news.shops = release.shops;
        if (release.title) news.title = release.title;
        if (release.catalogNo) news.catalogNo = release.catalogNo;
        news.createdAt = new Date();
        news.status = "Pending";
        news.createdBy = user.username;
        news.bannedInfo = { reason: '', isWaiting: false, createdAt: new Date() };
        await this.draftReleaseModel.deleteOne({ releaseId });

        return new ReleaseModal(await news.save())
    }

    async uploadCover(releaseId: string, user: User, files: any): Promise<ReleaseModal> {
        const release = await this.releaseModel.findOne({ releaseId }),
            isAdmin = user.roles.includes(EnumRoles.ROLE_ADMIN);
        if (!release) throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.RELEASE_NOT_FOUND)
        if (release.owner !== user.username && !isAdmin) throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION)

        if (!files || files.empty) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.FILE_NOT_FOUND)
        }
        const uploaded: String[] = [];
        files.forEach(file => {
            uploaded.push(file.originalname)
        });

        const upload = await this.fileService.saveFiles(user, uploaded, FileStorageEnum.IMAGES, releaseId);
        if (!upload || !upload.status) throw new ApplicationException(HttpStatus.SERVICE_UNAVAILABLE, MessageCode.FILE_CANNOT_UPLOAD)

        release.cover = upload.msg[0].internalPath;

        return new ReleaseModal(await release.save())
    }

    async uploadCoverDraft(releaseId: string, user: User, files: any): Promise<DraftReleaseModal> {
        const release = await this.draftReleaseModel.findOne({ releaseId }),
            isAdmin = user.roles.includes(EnumRoles.ROLE_ADMIN);
        if (!release) throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.RELEASE_NOT_FOUND)
        if (release.owner !== user.username && !isAdmin) throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION)

        if (!files || files.empty) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.FILE_NOT_FOUND)
        }
        const uploaded: String[] = [];
        files.forEach(file => {
            uploaded.push(file.originalname)
        });

        const upload = await this.fileService.saveFiles(user, uploaded, FileStorageEnum.IMAGES, releaseId);
        if (!upload || !upload.status) throw new ApplicationException(HttpStatus.SERVICE_UNAVAILABLE, MessageCode.FILE_CANNOT_UPLOAD)

        release.cover = upload.msg[0].internalPath;

        return new DraftReleaseModal(await release.save())
    }

    async deleteCover(releaseId: string, user: User): Promise<ReleaseModal> {
        const release = await this.releaseModel.findOne({ releaseId }),
            isAdmin = user.roles.includes(EnumRoles.ROLE_ADMIN);
        if (!release) throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.RELEASE_NOT_FOUND)
        if (release.owner !== user.username && !isAdmin) throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION)

        await this.fileService.delete(releaseId, { reason: 'Delete cover' });
        release.cover = "";

        return new ReleaseModal(await release.save())
    }

    async deleteCoverDraft(releaseId: string, user: User): Promise<DraftReleaseModal> {
        const release = await this.draftReleaseModel.findOne({ releaseId }),
            isAdmin = user.roles.includes(EnumRoles.ROLE_ADMIN);
        if (!release) throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.RELEASE_NOT_FOUND)
        if (release.owner !== user.username && !isAdmin) throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION)

        await this.fileService.delete(releaseId, { reason: 'Delete cover' });
        release.cover = "";

        return new DraftReleaseModal(await release.save())
    }
}
