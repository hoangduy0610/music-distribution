import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {UserSchema} from '../schemas/UserSchema';
import {UserController} from '../controllers/UserController';
import {UserService} from '../services/UserService';
import {UserRepository} from '../repositories/UserRepository';
import { OAuthService } from '../services/OAuthService';
@Module({
    imports: [MongooseModule.forFeature([
        {name: 'User', schema: UserSchema}
    ]),],
    controllers: [UserController],
    providers: [UserService, UserRepository, OAuthService],
    exports: [UserService],
})
export class UserModule {
}
