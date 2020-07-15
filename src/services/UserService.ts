import { HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationException } from '../controllers/ExceptionController';
import { MessageCode } from '../commons/MessageCode';
import { UserModal } from '../modals/UserModal';
import { UserRepository } from '../repositories/UserRepository';

@Injectable()
export class UserService {
    constructor(
        private readonly userRepository: UserRepository,
    ) {
    }
    async findOneByUsername(username: string): Promise<UserModal> {
        const users = await this.userRepository.findByUsername(username);
        if (!users || !users.length) {
            throw new ApplicationException(HttpStatus.NOT_FOUND, MessageCode.USER_NOT_REGISTER);
        }

        const user = users[0];
        if (user.isDeleted) {
            throw new ApplicationException(HttpStatus.FORBIDDEN, MessageCode.USER_IS_DELETED);
        }
        return new UserModal(user);
    }
}
