import { ApiProperty } from '@nestjs/swagger';

class Artists {
    @ApiProperty({ type: String, description: 'Tên người dùng', required: true })
    username: string;

    @ApiProperty({ type: String, description: 'Vai trò', required: true, enum: ['performer', 'producer'] })
    role: string;
}

export class TrackUpdateDto {
    @ApiProperty({ type: String, description: 'Tên track', required: true })
    readonly name: string;

    @ApiProperty({ type: Artists, description: 'Các nghệ sĩ', required: true, isArray: true })
    readonly artist: Artists[];

    @ApiProperty({ type: String, description: 'Thể loại', required: true, enum: ['Remix', 'Original'] })
    readonly versionType: string;

    @ApiProperty({ type: Boolean, description: 'Có từ ngữ không chuẩn mực', required: true })
    readonly explicit: boolean;

    @ApiProperty({ type: String, description: 'ISRC', required: true })
    readonly ISRC: string;

    @ApiProperty({ type: String, description: 'Credit', required: true })
    readonly credit: string;

    @ApiProperty({ type: String, description: 'Người đăng', required: true })
    readonly publisher: string;

    @ApiProperty({ type: String, description: 'Ngôn ngữ', required: true })
    readonly language: string;

    @ApiProperty({ type: Boolean, description: 'Có phải là chủ nhân không?', required: true })
    readonly isOwner: boolean;

    @ApiProperty({ type: Boolean, description: 'Có phải track này mới được phát hành lần đầu không?', required: true })
    readonly isFirstRelease: boolean;

    @ApiProperty({ type: Boolean, description: 'Có phải bundle không?', required: true })
    readonly isBundle: boolean;
}