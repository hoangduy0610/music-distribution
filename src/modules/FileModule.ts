import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {FileSchema} from '../schemas/FileSchema';
import {FileService} from '../services/FileService';
import {FileRepository} from '../repositories/FileRepository';
@Module({
    imports: [MongooseModule.forFeature([
        {name: 'File', schema: FileSchema}
    ]),],
    controllers: [],
    providers: [FileService, FileRepository],
    exports: [FileService],
})
export class FileModule {
}
