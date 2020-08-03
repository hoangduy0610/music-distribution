import {ApiProperty} from '@nestjs/swagger';

export class LabelCreateDto {
	@ApiProperty({type: String, description: 'Tên Label', required: true, example: 'Decabroda'})
	readonly name: string;
}
