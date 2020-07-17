import {JwtService} from '@nestjs/jwt';
import {HttpStatus, Injectable, Logger} from '@nestjs/common';
import {UserService} from './UserService';
import {UserAuthDto} from '../dtos/UserAuthDto';
import {ApplicationException} from '../controllers/ExceptionController';
import {MessageCode} from '../commons/MessageCode';
import {OAuthService} from './OAuthService';
import { UserAuthForgetDto } from '../dtos/UserAuthForgetDto';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly jwtService: JwtService,
		private readonly oAuthService: OAuthService,
	) {
	}

	async login(userAuthDto: UserAuthDto): Promise<any> {

		Logger.log('[START] - Login with user: ' + userAuthDto.username, null, false);

		const user = await this.userService.findOneByUsername(userAuthDto.username);

		if (!user) {
			throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.USER_NOT_FOUND);
		}
		if (!user.active) {
			throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Người dùng chưa được kích hoạt hoặc đang bị khóa");
		}
		const userData: any = await this.oAuthService.auth(userAuthDto.username, userAuthDto.password);
		const userPayload: any = {username: userData.username};
		const JWT = this.jwtService.sign(userPayload);
		return {token: JWT, info: user};
	}

	async resetPassphase(userAuthForgetDto:UserAuthForgetDto): Promise<any> {
		const user = await this.userService.findOneByUsername(userAuthForgetDto.username);

		if(!user){
			throw new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.USER_NOT_FOUND);
		}

		if(!user.active){
			throw new ApplicationException(HttpStatus.UNAUTHORIZED, "Người dùng chưa được kích hoạt hoặc đang bị khóa")
		}

		const userData: any = await this.oAuthService.reset(userAuthForgetDto.username, userAuthForgetDto.otp, userAuthForgetDto.password);

		return userData;
	}

	async checkToken(access_token: string): Promise<any> {
		Logger.log('[START] - Check token: ' + access_token, null, false);
		return await this.oAuthService.check_token(access_token);
	}


	async validateUser(payload: any): Promise<any> {
		Logger.log('[START] - Check: '+JSON.stringify(payload), null, false);
		return await this.userService.findOneByUsername(payload.username);
	}
}
