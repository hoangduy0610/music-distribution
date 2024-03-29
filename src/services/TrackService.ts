import { HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationException } from '../controllers/ExceptionController';
import { MessageCode } from '../commons/MessageCode';
import { TrackModal } from '../modals/TrackModal';
import { TrackRepository } from '../repositories/TrackRepository';
import { EnumRoles } from '../commons/EnumRoles';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Track, DraftTrack } from '../interfaces/TrackInterface';
import { User } from '../interfaces/UserInterface';
import { TrackUpdateDto } from '../dtos/TrackUpdateDto';
import { FileModal } from '../modals/FileModal';
import { FileService } from './FileService';
import { IdUtil } from '../utils/IdUtil';
import { FileStorageEnum } from '../commons/FileStorageEnum';
import { BannedInfoDto } from '../dtos/BannedInfoDto';
import { UserService } from './UserService';

@Injectable()
export class TrackService {
    constructor(
        @InjectModel('Track') private readonly trackModel: Model<Track>,
        @InjectModel('DraftTrack') private readonly draftTrackModel: Model<DraftTrack>,
        private readonly trackRepository: TrackRepository,
        private readonly fileService: FileService,
        private readonly userService: UserService,
    ) {
    }

    async findAllByReleaseId(releaseId: string): Promise<TrackModal[]> {
        return TrackModal.fromTracks(await this.trackRepository.findByReleaseId(releaseId));
    }

    async findArtists(trackId: string): Promise<any> {
        const track = await this.trackModel.findOne({ trackId });
        if (!track) {
            throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.TRACK_NOT_FOUND);
        }
        if (track.isDeleted) {
            throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.TRACK_IS_DELETED);
        }

        var userInfomation: any[] = [];
        const info = track.artist;

        for (let i = 0; i < info.length; i++) {
            const data = info[i];
            let user = await this.userService.findArtistByUsername(data.username);
            userInfomation.push({ name: user.fullName, role: data.role });
            //userInfomation[i].user = user;
        }
        return userInfomation;
    }


    async trackOrder(trackId: string, user: User, order: number): Promise<TrackModal> {
        const track: Track = await this.trackModel.findOne({ trackId }).exec();
        if (!track) {
            throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.TRACK_NOT_FOUND);
        }
        const isAdmin = user.roles && user.roles.includes(EnumRoles.ROLE_ADMIN);

        if (track.owner !== user.username && !isAdmin) {
            throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION);
        }

        if (order) {
            track.trackOrder = order;
        }

        track.updatedBy = user.username;

        return new TrackModal(await track.save());
    }

    async update(trackId: string, user: User, trackUpdateDto: TrackUpdateDto): Promise<TrackModal> {
        if (!trackId) {
            throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.TRACK_NOT_FOUND)
        }
        const track: Track = await this.trackModel.findOne({ trackId }).exec();
        if (!track) {
            throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.TRACK_NOT_FOUND);
        }
        const isAdmin = user.roles && user.roles.includes(EnumRoles.ROLE_ADMIN);

        if (track.owner !== user.username && !isAdmin) {
            throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION);
        }

        if (trackUpdateDto.ISRC) track.ISRC = trackUpdateDto.ISRC;
        if (trackUpdateDto.genre) track.genre = trackUpdateDto.genre;
        if (trackUpdateDto.artist) track.artist = trackUpdateDto.artist;
        if (trackUpdateDto.credit) track.credit = trackUpdateDto.credit;
        if (trackUpdateDto.explicit) track.explicit = trackUpdateDto.explicit;
        if (trackUpdateDto.isFirstRelease) track.isFirstRelease = trackUpdateDto.isFirstRelease;
        if (trackUpdateDto.isOwner) track.isOwner = trackUpdateDto.isOwner;
        if (trackUpdateDto.language) track.language = trackUpdateDto.language;
        if (trackUpdateDto.name) track.name = trackUpdateDto.name;
        if (trackUpdateDto.publisher) track.publisher = trackUpdateDto.publisher;
        if (trackUpdateDto.versionType) track.versionType = trackUpdateDto.versionType;
        track.updatedBy = user.username;

        return new TrackModal(await track.save());
    }

    async upload(user: User, releaseId: string, files: any): Promise<TrackModal> {
        if (!files || files.empty) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.FILE_NOT_FOUND)
        }
        const uploaded: String[] = [];
        files.forEach(file => {
            uploaded.push(file.originalname)
        });
        const trackId = IdUtil.generateId(13);
        const upload = await this.fileService.saveFiles(user, uploaded, FileStorageEnum.TRACKS, trackId);
        if (!upload || !upload.status) throw new ApplicationException(HttpStatus.SERVICE_UNAVAILABLE, MessageCode.FILE_CANNOT_UPLOAD)
        const track = new this.trackModel();
        track.trackId = trackId;
        track.releaseId = releaseId;
        track.owner = user.username;
        track.createdBy = user.username;
        track.bannedInfo = { reason: '', isWaiting: false, createdAt: new Date() };

        return new TrackModal(await track.save())
    }

    async delete(trackId: string, user: User, bannedInfoDto: BannedInfoDto): Promise<TrackModal> {
        const deleteRef = await this.trackModel.findOne({ trackId }).exec(),
            roles = user.roles,
            username = user.username;

        if (!deleteRef) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.TRACK_NOT_FOUND)
        }

        if (deleteRef.isDeleted) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.TRACK_IS_DELETED)
        }

        if (!bannedInfoDto.reason) {
            throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.BANNED_INFO_IS_NULL)
        }

        if (!roles.includes(EnumRoles.ROLE_ADMIN)) {
            if (deleteRef.owner !== username) {
                throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.ERROR_USER_NOT_HAVE_PERMISSION)
            }

            if (deleteRef.bannedInfo.isWaiting) {
                throw new ApplicationException(HttpStatus.BAD_REQUEST, MessageCode.TRACK_IS_WAITING)
            }

            deleteRef.bannedInfo.isWaiting = true;
        }

        deleteRef.bannedInfo.reason = bannedInfoDto.reason;
        deleteRef.bannedInfo.createdAt = new Date();
        await this.fileService.delete(trackId, bannedInfoDto);

        if (roles.includes(EnumRoles.ROLE_ADMIN)) {
            deleteRef.isDeleted = true;
            deleteRef.bannedInfo.isWaiting = false;
        }

        return new TrackModal(await deleteRef.save());
    }

    async deleteTracksByReleaseId(releaseId: string, bannedInfoDto: BannedInfoDto, user: User) {
        const tracks = await this.trackModel.find({ releaseId });
        return await Promise.all(
            tracks.map(
                async (track: Track) => {
                    track.bannedInfo.reason = bannedInfoDto.reason;
                    user.roles.includes(EnumRoles.ROLE_ADMIN) ? track.isDeleted = true : track.bannedInfo.isWaiting = true;
                    await this.fileService.delete(track.trackId, bannedInfoDto)
                }
            )
        );
    }
}
