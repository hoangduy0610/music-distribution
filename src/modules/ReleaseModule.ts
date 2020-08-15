import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReleaseSchema, DraftReleaseSchema } from '../schemas/ReleaseSchema';
import { ReleaseController } from '../controllers/ReleaseController';
import { ReleaseService } from '../services/ReleaseService';
import { ReleaseRepository } from '../repositories/ReleaseRepository';
import { DraftReleaseRepository } from '../repositories/DraftReleaseRepository';
import { TrackModule } from './TrackModule';
import { FileModule } from './FileModule';
import { UserModule } from './UserModule';
import { TrackSchema } from '../schemas/TrackSchema';
@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Track', schema: TrackSchema }]),
        MongooseModule.forFeature([{ name: 'Release', schema: ReleaseSchema }]),
        MongooseModule.forFeature([{ name: 'DraftRelease', schema: DraftReleaseSchema }]),
        TrackModule,
        FileModule,
        UserModule
    ],
    controllers: [ReleaseController],
    providers: [ReleaseService, ReleaseRepository, DraftReleaseRepository],
    exports: [ReleaseService],
})
export class ReleaseModule {
}
