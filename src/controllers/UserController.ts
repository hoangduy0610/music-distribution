import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Post,
    Put,
    Query,
    Req,
    Res,
    UploadedFiles,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from '../services/UserService';
import { RolesGuard } from '../guards/RoleGuard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../guards/RoleDecorator';
import { EnumRoles } from '../commons/EnumRoles';
import { UserCreateDto } from '../dtos/UserCreateDto';
import { UserUpdateProfileDto } from '../dtos/UserUpdateProfileDto';



@ApiTags('user')
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService
    ) {
    }

    @Get('/list')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(EnumRoles.ROLE_ADMIN)
    @ApiBearerAuth()
    @ApiQuery({ name: 'isDeleted', required: false, type: String, description: 'Đã xóa/chưa xóa', enum: ['true', 'false'] })
    @ApiQuery({ name: 'active', required: false, type: String, description: 'Trạng thái kích hoạt', enum: ['true', 'false'] })
    @ApiOperation({ summary: 'Lấy danh sách người dùng', description: 'Api lấy danh sách người dùng' })
    async findAll(@Req() req, @Res() res, @Query('isDeleted') isDeleted: string, @Query('active') active: string) {
        return res.status(HttpStatus.OK).json(await this.userService.findAll(isDeleted, active));
    }

    @Get('/profile')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Lấy profile', description: 'Api lấy profile' })
    async findProfile(@Req() req, @Res() res) {
        return res.status(HttpStatus.OK).json(await this.userService.findOneByUsername(req.user.username));
    }

    @Get('')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(EnumRoles.ROLE_ADMIN)
    @ApiBearerAuth()
    @ApiQuery({ name: 'username', required: false, type: String, description: 'Username' })
    @ApiOperation({ summary: 'Lấy profile cho Admin', description: 'Api lấy profile dành cho Admin' })
    async findOneByUsername(@Req() req, @Res() res, @Query('username') username: string) {
        return res.status(HttpStatus.OK).json(await this.userService.findOneByUsername(username));
    }

    @Post('/create')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(EnumRoles.ROLE_ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Tạo người dùng', description: 'Tạo người dùng bởi admin' })
    async create(@Req() req, @Res() res, @Body() userCreateDto: UserCreateDto) {
        return res.status(HttpStatus.OK).json(await this.userService.create(req.user.username, userCreateDto));
    }

    @Post('/register')
    @ApiOperation({ summary: 'Đăng ký người dùng', description: 'Tạo người dùng bởi user' })
    async register(@Req() req, @Res() res, @Body() userCreateDto: UserCreateDto) {
        return res.status(HttpStatus.OK).json(await this.userService.register(userCreateDto));
    }

    @Put('/active')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(EnumRoles.ROLE_ADMIN)
    @ApiBearerAuth()
    @ApiQuery({ name: 'userId', required: false, type: String, description: 'ID người dùng' })
    @ApiOperation({ summary: 'Kích hoạt người dùng', description: 'Admin kích hoạt người dùng' })
    async active(@Req() req, @Res() res, @Query('userId') userId: string) {
        return res.status(HttpStatus.OK).json(await this.userService.active(userId));
    }

    @Put('')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'username', required: false, type: String, description: 'Username người dùng cần update' })
    @ApiOperation({ summary: 'Sửa profile', description: 'Api sửa profile' })
    async update(@Req() req, @Res() res, @Query('username') username: string, @Body() userUpdateProfileDto: UserUpdateProfileDto) {
        return res.status(HttpStatus.OK).json(await this.userService.updateProfile(username, req.user.username, userUpdateProfileDto));
    }

    @Delete('')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'username', required: false, type: String, description: 'Username người dùng cần xóa' })
    @ApiQuery({ name: 'reason', required: false, type: String, description: 'Lý do xóa' })
    @ApiOperation({ summary: 'Xóa profile', description: 'Api xóa profile' })
    async delete(@Req() req, @Res() res, @Query('username') username: string, @Query('reason') reason: string) {
        return res.status(HttpStatus.OK).json(await this.userService.deleteProfile(username, req.user.username, reason));
    }
}
