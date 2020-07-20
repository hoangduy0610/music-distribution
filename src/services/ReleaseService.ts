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

@Injectable()
export class ReleaseService {
    constructor(
        @InjectModel('Release') private readonly releaseModel: Model<Release>,
        @InjectModel('DraftRelease') private readonly draftReleaseModel: Model<DraftRelease>,
        private readonly releaseRepository: ReleaseRepository,
        private readonly draftReleaseRepository: DraftReleaseRepository,
        private readonly trackService: TrackService,
    ) {
    }

    async findAll(isDeleted: string, user: User): Promise<ReleaseModal[]> {
        const roles = user.roles,
            owner = user.username;
        if (roles.includes(EnumRoles.ROLE_ADMIN)) return isDeleted ? await this.releaseRepository.findAll(isDeleted) : ReleaseModal.fromReleases(await this.releaseModel.find({}).exec());
        else return isDeleted ? await this.releaseRepository.findByOwner(isDeleted, owner) : ReleaseModal.fromReleases(await this.releaseModel.find({ owner }).exec());
    }

    async findAllDraft(isDeleted: string, user: User): Promise<ReleaseModal[]> {
        const roles = user.roles,
            owner = user.username;
        if (roles.includes(EnumRoles.ROLE_ADMIN)) return isDeleted ? await this.draftReleaseRepository.findAll(isDeleted) : DraftReleaseModal.fromReleases(await this.draftReleaseModel.find({}).exec());
        else return isDeleted ? await this.draftReleaseRepository.findByOwner(isDeleted, owner) : DraftReleaseModal.fromReleases(await this.draftReleaseModel.find({ owner }).exec());
    }

    async findOneByReleaseId(releaseId: string, user: User): Promise<ReleaseModal> {
        const release = await this.releaseModel.findOne({ releaseId });

        if (!releaseId) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.RELEASE_NOT_FOUND);
        }

        if (!user.roles.includes(EnumRoles.ROLE_ADMIN)) {
            if (release.owner !== user.username) {
                throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION)
            }
        }

        return new ReleaseModal(release);
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
        if (!releaseUpdate.active) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.RELEASE_NOT_ACTIVE);
        }

        if (releaseUpdateDto.artist && releaseUpdateDto.artist.length) releaseUpdate.artist = releaseUpdateDto.artist;
        if (releaseUpdateDto.barcode) releaseUpdate.barcode = releaseUpdateDto.barcode;
        if (releaseUpdateDto.countries) releaseUpdate.countries = releaseUpdateDto.countries;
        if (releaseUpdateDto.credit) releaseUpdate.credit = releaseUpdateDto.credit;
        if (releaseUpdateDto.description) releaseUpdate.description = releaseUpdateDto.description;
        if (releaseUpdateDto.genre) releaseUpdate.genre = releaseUpdateDto.genre;
        if (releaseUpdateDto.lableId) releaseUpdate.lableId = releaseUpdateDto.lableId;
        if (releaseUpdateDto.releaseAt) releaseUpdate.releaseAt = releaseUpdateDto.releaseAt;
        if (releaseUpdateDto.shops) releaseUpdate.shops = releaseUpdateDto.shops;
        if (releaseUpdateDto.title) releaseUpdate.title = releaseUpdateDto.title;
        releaseUpdate.updatedBy = user.username;

        return new ReleaseModal(await releaseUpdate.save());
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

        deleteRef.bannedInfo.reason = bannedInfoDto.reason;
        deleteRef.bannedInfo.createdAt = new Date();

        if (roles.includes(EnumRoles.ROLE_ADMIN)) {
            deleteRef.isDeleted = true;
            deleteRef.bannedInfo.isWaiting = false;
        }

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
        if (releaseUpdateDto.lableId) releaseUpdate.lableId = releaseUpdateDto.lableId;
        if (releaseUpdateDto.releaseAt) releaseUpdate.releaseAt = releaseUpdateDto.releaseAt;
        if (releaseUpdateDto.shops) releaseUpdate.shops = releaseUpdateDto.shops;
        if (releaseUpdateDto.title) releaseUpdate.title = releaseUpdateDto.title;
        if (releaseUpdateDto.catalogNo) releaseUpdate.catalogNo = releaseUpdateDto.catalogNo;

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

        const res = await this.draftReleaseModel.deleteOne({ releaseId });
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
        if (release.lableId) news.lableId = release.lableId;
        if (release.releaseAt) news.releaseAt = release.releaseAt;
        if (release.shops) news.shops = release.shops;
        if (release.title) news.title = release.title;
        if (release.catalogNo) news.catalogNo = release.catalogNo;
        news.createdAt = new Date();
        news.status = "Pending";
        news.bannedInfo = { reason: '', isWaiting: false, createdAt: new Date() };

        return new ReleaseModal(await news.save())
    }
}
