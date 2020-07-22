import {PassportStrategy} from '@nestjs/passport';
import {HttpStatus, Injectable, Logger} from '@nestjs/common';
import {AuthService} from '../services/AuthService';
import {ApplicationException} from '../controllers/ExceptionController';
import { Strategy } from 'passport-http-bearer';
import {MessageCode} from "../commons/MessageCode";

@Injectable()
export class OAuthStrategy extends PassportStrategy(Strategy, 'oauth') {
	constructor(private readonly authService: AuthService) {
		super();
	}


	async validate(token, cb) {
		const data = await this.authService.checkToken(token);
		Logger.log('[ENDED] - Check token: ' + data.username);
		const user = await this.authService.validateUser(data);
		if (user) {
			cb(null, user);
		} else {
			cb(new ApplicationException(HttpStatus.UNAUTHORIZED, MessageCode.USER_NOT_FOUND), null)
		}
	}
}
