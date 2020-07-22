import {ApiProperty} from '@nestjs/swagger';

export class UserUpdateProfileDto {    
    @ApiProperty({type: String, description: 'Họ và tên', required: true})
    readonly fullName: string;

    @ApiProperty({type: String, description: 'Tuổi', required: true})
    readonly age: string;

    @ApiProperty({type: String, description: 'Địa chỉ', required: true})
    readonly address: string;

    @ApiProperty({type: String, description: 'Số điện thoại', required: true})
    readonly phone: string;

    @ApiProperty({type: String, description: 'Email', required: true})
    readonly email: string;
}
