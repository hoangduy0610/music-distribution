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

@Injectable()
export class TrackService {
    constructor(
        @InjectModel('Track') private readonly trackModel: Model<Track>,
        @InjectModel('DraftTrack') private readonly draftTrackModel: Model<DraftTrack>,
        private readonly trackRepository: TrackRepository,
    ) {
    }

    async findAllByReleaseId(releaseId:string):Promise<TrackModal[]>{
        return TrackModal.fromTracks(await this.trackRepository.findByReleaseId(releaseId));
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

        return new TrackModal(await track.save());
    }
}
