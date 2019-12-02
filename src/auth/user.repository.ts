import { Repository, EntityRepository } from 'typeorm';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const UNIQUE_CONSTRAINT_ERROR = '23505';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<User> {
        const { username, password } = authCredentialsDto;

        const salt = await bcrypt.genSalt();
        const hashedPassword = await this.hash(password, salt);

        try {
            return await this.save({ username, password: hashedPassword, salt });
        } catch (err) {
            if (err.code === UNIQUE_CONSTRAINT_ERROR) {
                throw new ConflictException();
            }

            throw new InternalServerErrorException();
        }
    }

    async signIn(authCredentialsDto: AuthCredentialsDto): Promise<User | void> {
        const { username, password } = authCredentialsDto;

        const user = await this.findOne({ username });

        if (!user || !(await user.validatePassword(password))) {
            return null;
        }

        return user;
    }

    private hash(password: string, salt: string): Promise<string> {
        return bcrypt.hash(password, salt);
    }
}
