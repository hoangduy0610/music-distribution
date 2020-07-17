import { Body, Controller, HttpStatus, Post, Req, Res, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserAuthDto } from '../dtos/UserAuthDto';
import { UserAuthForgetDto } from '../dtos/UserAuthForgetDto';
import { AuthService } from '../services/AuthService';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {
	}

	@Post('')
	@ApiOperation({ summary: 'Đăng nhập', description: 'Api đăng nhập người dùng' })
	async auth(@Req() req, @Res() res, @Body() userAuthDto: UserAuthDto) {
		return res.status(HttpStatus.OK).json(await this.authService.login(userAuthDto));
	}

	@Post('/reset')
	async reset(@Req() req, @Res() res, @Body() userAuthForgetDto: UserAuthForgetDto) {
		console.log('callback');
		return res.status(HttpStatus.OK).json(await this.authService.resetPassphase(userAuthForgetDto));
	}
}
