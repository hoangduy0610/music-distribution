import { ApiProperty } from '@nestjs/swagger';

export class LabelUpdateDto {
    @ApiProperty({ type: String, description: 'Tên Label', required: true, example: 'Decabroda' })
    readonly name: string;

    @ApiProperty({ type: Boolean, description: 'Active', required: false, example: false })
    readonly active: boolean;

    @ApiProperty({ type: String, description: 'Người sở hữu', required: false, example: 'admin' })
    readonly owner: string;
}
