import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {UserSchema} from '../schemas/UserSchema';
import {UserController} from '../controllers/UserController';
import {UserService} from '../services/UserService';
import {UserRepository} from '../repositories/UserRepository';
@Module({
    imports: [MongooseModule.forFeature([
        {name: 'User', schema: UserSchema}
    ])],
    controllers: [UserController],
    providers: [UserService, UserRepository],
    exports: [UserService],
})
export class UserModule {
}
