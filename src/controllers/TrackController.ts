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
import { TrackService } from '../services/TrackService';
import { RolesGuard } from '../guards/RoleGuard';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../guards/RoleDecorator';
import { EnumRoles } from '../commons/EnumRoles';



@ApiTags('track')
@Controller('track')
export class TrackController {
    constructor(
        private readonly trackService: TrackService
    ) {
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
}
