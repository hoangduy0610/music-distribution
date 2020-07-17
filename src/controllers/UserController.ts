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
    @ApiQuery({ name: 'isDeleted', required: false, type: String, description: 'Trạng thái kích hoạt', enum: ['true', 'false'] })
    @ApiOperation({ summary: 'Lấy danh sách người dùng', description: 'Api lấy danh sách người dùng' })
    async findAll(@Req() req, @Res() res, @Query('isDeleted') isDeleted: string) {
        return res.status(HttpStatus.OK).json(await this.userService.findAll(isDeleted));
    }

    @Get('')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'userId', required: false, type: String, description: 'ID người dùng' })
    @ApiOperation({ summary: 'Lấy profile', description: 'Api lấy profile' })
    async findOneByUid(@Req() req, @Res() res, @Query('userId') userId: string) {
        return res.status(HttpStatus.OK).json(await this.userService.findOneByUid(userId, req.user.username));
    }

    @Post('/create')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(EnumRoles.ROLE_ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Tạo người dùng', description: 'Tạo người dùng bởi admin' })
    async create(@Req() req, @Res() res, @Body() userCreateDto: UserCreateDto) {
        return res.status(HttpStatus.OK).json(await this.userService.create(req.user.username, userCreateDto));
    }
}
