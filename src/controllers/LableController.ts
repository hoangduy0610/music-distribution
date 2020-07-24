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
import { LableService } from '../services/LableService';
import { RolesGuard } from '../guards/RoleGuard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../guards/RoleDecorator';
import { EnumRoles } from '../commons/EnumRoles';
import { LableCreateDto } from '../dtos/LableCreateDto';
import { LableUpdateDto } from '../dtos/LableUpdateDto';
import { BannedInfoDto } from '../dtos/BannedInfoDto';



@ApiTags('lable')
@Controller('lable')
export class LableController {
    constructor(
        private readonly lableService: LableService
    ) {
    }

    @Get('/list')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'isDeleted', required: false, type: String, description: 'Trạng thái kích hoạt', enum: ['true', 'false'] })
    @ApiOperation({ summary: 'Lấy danh sách lable', description: 'Api lấy danh sách lable' })
    async findAll(@Req() req, @Res() res, @Query('isDeleted') isDeleted: string) {
        return res.status(HttpStatus.OK).json(await this.lableService.findAll(isDeleted, req.user));
    }

    @Post('')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Tạo mới lable', description: 'Tạo mới 1 lable' })
    async create(@Req() req, @Res() res, @Body() lableCreateDto: LableCreateDto) {
        return res.status(HttpStatus.OK).json(await this.lableService.create(req.user, lableCreateDto));
    }

    @Put('')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'id', required: true, type: String, description: 'Id lable' })
    @ApiOperation({ summary: 'Sửa lable', description: 'Sửa 1 lable' })
    async update(@Req() req, @Res() res, @Query('id') id: string, @Body() lableUpdateDto: LableUpdateDto) {
        return res.status(HttpStatus.OK).json(await this.lableService.update(id, req.user, lableUpdateDto));
    }

    @Delete('')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'id', required: true, type: String, description: 'Id lable' })
    @ApiOperation({ summary: 'Xóa lable', description: 'Xóa 1 lable' })
    async delete(@Req() req, @Res() res, @Query('id') id: string, @Body() bannedInfoDto: BannedInfoDto) {
        return res.status(HttpStatus.OK).json(await this.lableService.delete(id, req.user, bannedInfoDto));
    }
}
