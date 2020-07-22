import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';
import {AuthService} from '../services/AuthService';
import {UserModule} from './UserModule';
import {JwtStrategy} from '../guards/JwtStrategy';
import {Constant} from '../commons/Constant';
import {AuthController} from '../controllers/AuthController';
import {OAuthService} from '../services/OAuthService';
import {OAuthStrategy} from "../guards/OAuthStrategy";

@Module({
	imports: [
		PassportModule.register({defaultStrategy: 'jwt'}),
		JwtModule.register({
			secret: Constant.JWT_SECRET,
			signOptions: {
				expiresIn: 2592000,
			},
		}),
		UserModule,
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, OAuthService, OAuthStrategy],
	exports: [PassportModule, AuthService],
})
export class AuthModule {
}
