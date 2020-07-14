import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';
import {AuthService} from '../services/AuthService';
import {AuthController} from '../controllers/AuthController';

@Module({
	imports: [
		PassportModule.register({defaultStrategy: 'jwt'}),
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: {
				expiresIn: 2592000,
			},
		}),
	],
	controllers: [AuthController],
	providers: [AuthService],
	exports: [PassportModule, AuthService],
})
export class AuthModule {
}
