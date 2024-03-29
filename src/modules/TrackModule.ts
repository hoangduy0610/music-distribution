import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrackSchema, DraftTrackSchema } from '../schemas/TrackSchema';
import { TrackController } from '../controllers/TrackController';
import { TrackService } from '../services/TrackService';
import { TrackRepository } from '../repositories/TrackRepository';
import { FileModule } from './FileModule';
import { UserModule } from './UserModule';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Track', schema: TrackSchema }]),
    MongooseModule.forFeature([{ name: 'DraftTrack', schema: DraftTrackSchema }]),
    /*MulterModule.registerAsync({
        useFactory: () => ({
          dest: './upload',
        }),
      }),*/
    FileModule,
    UserModule
  ],
  controllers: [TrackController],
  providers: [TrackService, TrackRepository],
  exports: [TrackService],
})
export class TrackModule {
}
