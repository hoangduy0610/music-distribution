import {ApiProperty} from '@nestjs/swagger';

export class BannedInfoDto {
	@ApiProperty({type: String, description: 'Lý do', required: true, example: 'Láo'})
	readonly reason: string;
}