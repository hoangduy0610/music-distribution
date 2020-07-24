import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReleaseSchema, DraftReleaseSchema } from '../schemas/ReleaseSchema';
import { ReleaseController } from '../controllers/ReleaseController';
import { ReleaseService } from '../services/ReleaseService';
import { ReleaseRepository } from '../repositories/ReleaseRepository';
import { DraftReleaseRepository } from '../repositories/DraftReleaseRepository';
import { TrackModule } from './TrackModule';
import { FileModule } from './FileModule';
@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Release', schema: ReleaseSchema }]),
        MongooseModule.forFeature([{ name: 'DraftRelease', schema: DraftReleaseSchema }]),
        TrackModule,
        FileModule
    ],
    controllers: [ReleaseController],
    providers: [ReleaseService, ReleaseRepository, DraftReleaseRepository],
    exports: [ReleaseService],
})
export class ReleaseModule {
}
