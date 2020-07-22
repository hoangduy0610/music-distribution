import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {LableSchema} from '../schemas/LableSchema';
import {LableController} from '../controllers/LableController';
import {LableService} from '../services/LableService';
import {LableRepository} from '../repositories/LableRepository';
@Module({
    imports: [MongooseModule.forFeature([
        {name: 'Lable', schema: LableSchema}
    ]),],
    controllers: [LableController],
    providers: [LableService, LableRepository],
    exports: [LableService],
})
export class LableModule {
}
