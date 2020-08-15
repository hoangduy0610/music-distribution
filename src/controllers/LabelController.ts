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
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import { LabelService } from '../services/LabelService';
import { RolesGuard } from '../guards/RoleGuard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../guards/RoleDecorator';
import { EnumRoles } from '../commons/EnumRoles';
import { LabelCreateDto } from '../dtos/LabelCreateDto';
import { LabelUpdateDto } from '../dtos/LabelUpdateDto';
import { BannedInfoDto } from '../dtos/BannedInfoDto';
import { FileUploadDto } from '../dtos/FileUploadDto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FileUtils } from '../utils/FileUtil';

const myStorage = diskStorage({
    // Specify where to save the file
    destination: (req, file, cb) => {
        cb(null, process.env.DESTINATION_UPLOAD);
    },
    // Specify the file name
    filename: FileUtils.exceptFileImage,
});

@ApiTags('label')
@Controller('label')
export class LabelController {
    constructor(
        private readonly labelService: LabelService
    ) {
    }

    @Get('/list')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'isDeleted', required: false, type: String, description: 'Trạng thái kích hoạt', enum: ['true', 'false'] })
    @ApiOperation({ summary: 'Lấy danh sách label', description: 'Api lấy danh sách label' })
    async findAll(@Req() req, @Res() res, @Query('isDeleted') isDeleted: string) {
        return res.status(HttpStatus.OK).json(await this.labelService.findAll(isDeleted, req.user));
    }

    @Get('')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'id', required: true, type: String, description: 'Id label' })
    @ApiOperation({ summary: 'Lấy thông tin label', description: 'Api lấy thông tin label' })
    async find(@Req() req, @Res() res, @Query('id') id: string) {
        return res.status(HttpStatus.OK).json(await this.labelService.find(id, req.user));
    }

    @Post('')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Tạo mới label', description: 'Tạo mới 1 label' })
    async create(@Req() req, @Res() res, @Body() labelCreateDto: LabelCreateDto) {
        return res.status(HttpStatus.OK).json(await this.labelService.create(req.user, labelCreateDto));
    }

    @Put('')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'id', required: true, type: String, description: 'Id label' })
    @ApiOperation({ summary: 'Sửa label', description: 'Sửa 1 label' })
    async update(@Req() req, @Res() res, @Query('id') id: string, @Body() labelUpdateDto: LabelUpdateDto) {
        return res.status(HttpStatus.OK).json(await this.labelService.update(id, req.user, labelUpdateDto));
    }

    @Delete('')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'id', required: true, type: String, description: 'Id label' })
    @ApiOperation({ summary: 'Xóa label', description: 'Xóa 1 label' })
    async delete(@Req() req, @Res() res, @Query('id') id: string, @Body() bannedInfoDto: BannedInfoDto) {
        return res.status(HttpStatus.OK).json(await this.labelService.delete(id, req.user, bannedInfoDto));
    }

    @Post('/image')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'id', required: true, type: String, description: 'Label Id' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FilesInterceptor('files', 20, {
        storage: myStorage,
    }))
    @ApiBody({
        description: 'List Image',
        type: FileUploadDto,
    })
    @ApiOperation({ summary: 'Thêm cover cho label', description: 'Thêm cover cho label' })
    async uploadCover(@Req() req, @Res() res, @Query('id') id: string, @UploadedFiles() files) {
        return res.status(HttpStatus.OK).json(await this.labelService.uploadCover(id, req.user, files));
    }

    @Delete('/image')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'id', required: true, type: String, description: 'Label Id' })
    @ApiOperation({ summary: 'Xóa cover label', description: 'Xóa cover label' })
    async deleteCover(@Req() req, @Res() res, @Query('id') id: string,) {
        return res.status(HttpStatus.OK).json(await this.labelService.deleteCover(id, req.user));
    }
}
