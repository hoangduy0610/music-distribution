import { ApiProperty } from '@nestjs/swagger';

class Artists {
    @ApiProperty({ type: String, description: 'Tên người dùng' })
    username: string;

    @ApiProperty({ type: String, description: 'Vai trò' })
    role: string;
}

export class ReleaseUpdateDto {
    @ApiProperty({ type: String, description: 'Tên sản phẩm', required: true })
    readonly title: string;

    @ApiProperty({ type: Artists, description: 'Các nghệ sĩ', required: true, isArray: true })
    readonly artist: Artists[];

    @ApiProperty({ type: String, description: 'Id Lable', required: true })
    readonly lableId: string;

    @ApiProperty({ type: String, description: 'Thể Loại', required: true })
    readonly genre: string;

    @ApiProperty({ type: String, description: 'UPC', required: true })
    readonly barcode: string;

    @ApiProperty({ type: String, description: 'Credit', required: true })
    readonly credit: string;

    @ApiProperty({ type: String, description: 'Quốc gia', required: true })
    readonly countries: string;

    @ApiProperty({ type: String, description: 'Cửa hàng', required: true })
    readonly shops: string;

    @ApiProperty({ type: String, description: 'Mô tả', required: true })
    readonly description: string;

    @ApiProperty({ type: Date, description: 'Thời gian phát hành', required: true })
    readonly releaseAt: Date;
}