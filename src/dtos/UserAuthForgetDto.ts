import {ApiProperty} from '@nestjs/swagger';

export class UserAuthForgetDto {
	@ApiProperty({type: String, description: 'Tên người dùng', required: true, example: 'admin'})
    readonly username: string;
    
    @ApiProperty({type: String, description: 'OTP', required: true, example: '000000'})
	readonly otp: string;

	@ApiProperty({type: String, description: 'Mật khẩu mới', required: true, example: 'Th0ngMinh@2020'})
	readonly password: string;
}
