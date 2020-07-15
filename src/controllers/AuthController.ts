import {Body, Controller, HttpStatus, Post, Req, Res, Get, UseGuards} from '@nestjs/common';
import {ApiOperation, ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {UserAuthDto} from '../dtos/UserAuthDto';
import {AuthService} from '../services/AuthService';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/guards/RoleGuard';
import { Roles } from 'src/guards/RoleDecorator';
import { EnumRoles } from 'src/commons/EnumRoles';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {
	}

	@Post('')
	@ApiOperation({summary: 'Đăng nhập', description: 'Api đăng nhập người dùng'})
	async auth(@Req() req, @Res() res, @Body() userAuthDto: UserAuthDto) {
		return res.status(HttpStatus.OK).json(await this.authService.login(userAuthDto));
	}

    @Get('/callback')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(EnumRoles.ROLE_ADMIN)
    @ApiBearerAuth()
	async callback(@Req() req, @Res() res) {
		console.log('callback');
		return res.status(HttpStatus.OK).json({msg:'ok'});
	}
}
