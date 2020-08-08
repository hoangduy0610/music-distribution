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
import { ReleaseService } from '../services/ReleaseService';
import { RolesGuard } from '../guards/RoleGuard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../guards/RoleDecorator';
import { EnumRoles } from '../commons/EnumRoles';
import { ReleaseUpdateDto } from '../dtos/ReleaseUpdateDto';
import { BannedInfoDto } from '../dtos/BannedInfoDto';
import { DraftReleaseUpdateDto } from '../dtos/DraftReleaseUpdateDto';
import { diskStorage } from 'multer';
import { FileUtils } from '../utils/FileUtil';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileUploadDto } from '../dtos/FileUploadDto';

const myStorage = diskStorage({
    // Specify where to save the file
    destination: (req, file, cb) => {
        cb(null, process.env.DESTINATION_UPLOAD);
    },
    // Specify the file name
    filename: FileUtils.exceptFileImage,
});

@ApiTags('release')
@Controller('release')
export class ReleaseController {
    constructor(
        private readonly releaseService: ReleaseService
    ) {
    }
    @Post('')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'releaseId', required: true, type: String, description: 'Release ID' })
    @ApiOperation({ summary: 'Thêm release', description: 'Chuyển trạng thái từ draft sang pending' })
    async create(@Req() req, @Res() res, @Query('releaseId') releaseId: string) {
        return res.status(HttpStatus.OK).json(await this.releaseService.create(releaseId, req.user));
    }

    @Get('/list')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'isDeleted', required: false, type: String, description: 'Đã xóa/chưa xóa', enum: ['true', 'false'] })
    @ApiQuery({ name: 'active', required: false, type: String, description: 'Trạng thái kích hoạt', enum: ['true', 'false'] })
    @ApiOperation({ summary: 'Lấy danh sách release', description: 'Api lấy danh sách release' })
    async findAll(@Req() req, @Res() res, @Query('isDeleted') isDeleted: string, @Query('active') active: string) {
        return res.status(HttpStatus.OK).json(await this.releaseService.findAll(isDeleted, active, req.user));
    }

    @Get('/artists')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'releaseId', required: true, type: String, description: 'Release ID' })
    @ApiOperation({ summary: 'Lấy danh sách Artists', description: 'Api lấy danh sách artist' })
    async findArtists(@Req() req, @Res() res, @Query('releaseId') releaseId: string) {
        return res.status(HttpStatus.OK).json(await this.releaseService.findArtists(releaseId));
    }

    @Get('/draft/list')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Lấy danh sách draft', description: 'Api lấy danh sách draft' })
    async findAllDraft(@Req() req, @Res() res) {
        return res.status(HttpStatus.OK).json(await this.releaseService.findAllDraft(req.user));
    }

    @Get('/draft/tracks')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'releaseId', required: true, type: String, description: 'Release ID' })
    @ApiOperation({ summary: 'Lấy các track trong draft release', description: 'Api lấy track trong draft release' })
    async findTracksDraft(@Req() req, @Res() res, @Query('releaseId') releaseId: string) {
        return res.status(HttpStatus.OK).json(await this.releaseService.findAllTrackDraft(releaseId, req.user));
    }

    @Get('/tracks')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'releaseId', required: true, type: String, description: 'Release ID' })
    @ApiOperation({ summary: 'Lấy các track trong release', description: 'Api lấy track trong release' })
    async findTracks(@Req() req, @Res() res, @Query('releaseId') releaseId: string) {
        return res.status(HttpStatus.OK).json(await this.releaseService.findAllTrack(releaseId, req.user));
    }

    @Get('')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'releaseId', required: true, type: String, description: 'Release ID' })
    @ApiOperation({ summary: 'Lấy thông tin release', description: 'Api lấy thông tin release' })
    async findOne(@Req() req, @Res() res, @Query('releaseId') releaseId: string) {
        return res.status(HttpStatus.OK).json(await this.releaseService.findOneByReleaseId(releaseId, req.user));
    }

    @Get('/draft')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'releaseId', required: true, type: String, description: 'Release ID' })
    @ApiOperation({ summary: 'Lấy thông tin release', description: 'Api lấy thông tin release' })
    async findOneDraft(@Req() req, @Res() res, @Query('releaseId') releaseId: string) {
        return res.status(HttpStatus.OK).json(await this.releaseService.findOneDraftByReleaseId(releaseId, req.user));
    }

    @Put('')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'releaseId', required: true, type: String, description: 'Release ID' })
    @ApiOperation({ summary: 'Sửa release', description: 'Sửa thông tin release' })
    async update(@Req() req, @Res() res, @Query('releaseId') releaseId: string, @Body() releaseUpdateDto: ReleaseUpdateDto) {
        return res.status(HttpStatus.OK).json(await this.releaseService.update(releaseId, req.user, releaseUpdateDto));
    }

    @Put('/active')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @Roles(EnumRoles.ROLE_ADMIN)
    @ApiQuery({ name: 'releaseId', required: true, type: String, description: 'Release ID' })
    @ApiOperation({ summary: 'Active release', description: 'Kích hoạt release' })
    async active(@Req() req, @Res() res, @Query('releaseId') releaseId: string) {
        return res.status(HttpStatus.OK).json(await this.releaseService.active(releaseId, req.user.username));
    }

    @Put('/released')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @Roles(EnumRoles.ROLE_ADMIN)
    @ApiQuery({ name: 'releaseId', required: true, type: String, description: 'Release ID' })
    @ApiOperation({ summary: 'Đánh dấu released', description: 'Đánh dấu released' })
    async released(@Req() req, @Res() res, @Query('releaseId') releaseId: string) {
        return res.status(HttpStatus.OK).json(await this.releaseService.released(releaseId, req.user.username));
    }

    @Put('/draft')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'releaseId', required: false, type: String, description: 'Release ID' })
    @ApiOperation({ summary: 'Sửa release draft', description: 'Sửa thông tin release draft' })
    async updateDraft(@Req() req, @Res() res, @Query('releaseId') releaseId: string, @Body() releaseUpdateDto: DraftReleaseUpdateDto) {
        return res.status(HttpStatus.OK).json(await this.releaseService.updateDraft(releaseId, req.user, releaseUpdateDto));
    }

    @Delete('')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'releaseId', required: true, type: String, description: 'Release ID' })
    @ApiOperation({ summary: 'Xóa release', description: 'Xóa release' })
    async delete(@Req() req, @Res() res, @Query('releaseId') releaseId: string, @Body() bannedInfoDto: BannedInfoDto) {
        return res.status(HttpStatus.OK).json(await this.releaseService.delete(releaseId, req.user, bannedInfoDto));
    }

    @Delete('/draft')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'releaseId', required: true, type: String, description: 'Release ID' })
    @ApiOperation({ summary: 'Xóa release draft', description: 'Xóa release draft' })
    async deleteDraft(@Req() req, @Res() res, @Query('releaseId') releaseId: string) {
        return res.status(HttpStatus.OK).json(await this.releaseService.deleteDraft(releaseId, req.user));
    }

    @Post('/image')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'releaseId', required: true, type: String, description: 'Release ID' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FilesInterceptor('files', 20, {
        storage: myStorage,
    }))
    @ApiBody({
        description: 'List Image',
        type: FileUploadDto,
    })
    @ApiOperation({ summary: 'Thêm cover cho release', description: 'Thêm cover cho release' })
    async uploadCover(@Req() req, @Res() res, @Query('releaseId') releaseId: string, @UploadedFiles() files) {
        return res.status(HttpStatus.OK).json(await this.releaseService.uploadCover(releaseId, req.user, files));
    }

    @Delete('/image')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'releaseId', required: true, type: String, description: 'Release ID' })
    @ApiOperation({ summary: 'Xóa cover release', description: 'Xóa cover release' })
    async deleteCover(@Req() req, @Res() res, @Query('releaseId') releaseId: string) {
        return res.status(HttpStatus.OK).json(await this.releaseService.deleteCover(releaseId, req.user));
    }

    @Post('/draft/image')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'releaseId', required: true, type: String, description: 'Release ID' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FilesInterceptor('files', 20, {
        storage: myStorage,
    }))
    @ApiBody({
        description: 'List Image',
        type: FileUploadDto,
    })
    @ApiOperation({ summary: 'Thêm cover cho release', description: 'Thêm cover cho release' })
    async uploadCoverDraft(@Req() req, @Res() res, @Query('releaseId') releaseId: string, @UploadedFiles() files) {
        return res.status(HttpStatus.OK).json(await this.releaseService.uploadCoverDraft(releaseId, req.user, files));
    }

    @Delete('/draft/image')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'releaseId', required: true, type: String, description: 'Release ID' })
    @ApiOperation({ summary: 'Xóa cover release', description: 'Xóa cover release' })
    async deleteCoverDraft(@Req() req, @Res() res, @Query('releaseId') releaseId: string) {
        return res.status(HttpStatus.OK).json(await this.releaseService.deleteCoverDraft(releaseId, req.user));
    }
}
