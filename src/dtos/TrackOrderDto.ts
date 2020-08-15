import { ApiProperty } from '@nestjs/swagger';

export class TrackOrderDto {
    @ApiProperty({ type: String, description: 'List Order track', required: true, isArray: true })
    readonly trackIds: string[];
}