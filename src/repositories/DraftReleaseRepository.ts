import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DraftRelease } from "../interfaces/ReleaseInterface";

@Injectable()
export class DraftReleaseRepository {
    constructor(
        @InjectModel('DraftRelease') private readonly draftReleaseModel: Model<DraftRelease>
    ) {
    }

    async findAll(): Promise<any[]> {
        return await this.draftReleaseModel.find({}).exec();
    }

    async findByOwner(owner: string):Promise<any[]> {
        return await this.draftReleaseModel.aggregate([
            {
                $match: {
                    owner
                },
            },
        ]);
    }
}
