import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Track, DraftTrack } from "../interfaces/TrackInterface";

@Injectable()
export class TrackRepository {
    constructor(
        @InjectModel('Track') private readonly trackModel: Model<Track>,
        @InjectModel('DraftTrack') private readonly draftTrackModel: Model<DraftTrack>
    ) {
    }

    async findByReleaseId(releaseId: string): Promise<any> {
        return await this.trackModel.aggregate([
            {
                $match: {
                    isDeleted: false, // Đã xóa hay chưa
                    releaseId
                },
            },
            {
                $sort: {
                    trackOrder: 1
                }
            }
        ]);
    }
}
