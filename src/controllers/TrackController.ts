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
    UseGuards,
    UseInterceptors,
    Bind,
    UploadedFiles,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiOperation, ApiTags, ApiBody } from '@nestjs/swagger';
import { TrackService } from '../services/TrackService';
import { RolesGuard } from '../guards/RoleGuard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../guards/RoleDecorator';
import { EnumRoles } from '../commons/EnumRoles';
import { diskStorage } from 'multer';
import { TrackUpdateDto } from '../dtos/TrackUpdateDto';
import { FilesInterceptor } from "@nestjs/platform-express";
import { FileUtils } from '../utils/FileUtil';
import { FileUploadDto } from '../dtos/FileUploadDto';
import { BannedInfoDto } from '../dtos/BannedInfoDto';

export const myStorage = diskStorage({
    // Specify where to save the file
    destination: (req, file, cb) => {
        cb(null, process.env.DESTINATION_UPLOAD);
    },
    // Specify the file name
    filename: FileUtils.exceptFileMusic,
});

@ApiTags('track')
@Controller('track')
export class TrackController {
    constructor(
        private readonly trackService: TrackService
    ) {
    }

    @Post('')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FilesInterceptor('files', 20, {
        storage: myStorage,
    }))
    //@ApiImplicitFile({ name: 'files', required: true })
    @ApiBody({
        description: 'List Music',
        type: FileUploadDto,
    })
    @ApiOperation({ summary: 'Thêm', description: 'Thêm track' })
    async upload(@Req() req, @Res() res, @UploadedFiles() files) {
        return res.status(HttpStatus.OK).json(await this.trackService.upload(req.user, files));
    }

    @Put('')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'trackId', required: true, type: String, description: 'Track ID' })
    @ApiOperation({ summary: 'Sửa track', description: 'Sửa track' })
    async update(@Req() req, @Res() res, @Query('trackId') trackId: string, @Body() trackUpdateDto: TrackUpdateDto) {
        return res.status(HttpStatus.OK).json(await this.trackService.update(trackId, req.user, trackUpdateDto));
    }

    @Put('/order')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'trackId', required: true, type: String, description: 'Track ID' })
    @ApiQuery({ name: 'order', required: true, type: Number, description: 'Thứ tự bài hát' })
    @ApiOperation({ summary: 'Sửa thứ tự track', description: 'Sửa thứ tự track' })
    async updateOrder(@Req() req, @Res() res, @Query('trackId') trackId: string, @Query('order') order: number) {
        return res.status(HttpStatus.OK).json(await this.trackService.trackOrder(trackId, req.user, order));
    }

    @Delete('')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'trackId', required: true, type: String, description: 'Track ID' })
    @ApiOperation({ summary: 'Xóa track', description: 'Xóa track' })
    async delete(@Req() req, @Res() res, @Query('trackId') trackId: string, @Body() bannedInfoDto: BannedInfoDto) {
        return res.status(HttpStatus.OK).json(await this.trackService.delete(trackId, req.user, bannedInfoDto));
    }
}
