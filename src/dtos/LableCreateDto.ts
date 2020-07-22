import {ApiProperty} from '@nestjs/swagger';

export class LableCreateDto {
	@ApiProperty({type: String, description: 'Tên Lable', required: true, example: 'Decabroda'})
	readonly name: string;
}
