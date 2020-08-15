import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LabelSchema } from '../schemas/LabelSchema';
import { LabelController } from '../controllers/LabelController';
import { LabelService } from '../services/LabelService';
import { LabelRepository } from '../repositories/LabelRepository';
import { FileModule } from './FileModule';
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: 'Label', schema: LabelSchema }
        ]),
        FileModule
    ],
    controllers: [LabelController],
    providers: [LabelService, LabelRepository],
    exports: [LabelService],
})
export class LabelModule {
}
