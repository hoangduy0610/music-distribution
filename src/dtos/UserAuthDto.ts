import {ApiProperty} from '@nestjs/swagger';

export class UserAuthDto {
	@ApiProperty({type: String, description: 'Tên người dùng', required: true, example: 'admin'})
	readonly username: string;

	@ApiProperty({type: String, description: 'Mật khẩu', required: true, example: 'Th0ngMinh@2020'})
	readonly password: string;
}
