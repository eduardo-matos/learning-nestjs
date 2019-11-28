import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(UserRepository)
        private userRespository: UserRepository,
        private jwtService: JwtService,
    ) {}

    signUpUser(authCredentialsDto: AuthCredentialsDto): Promise<User> {
        return this.userRespository.signUp(authCredentialsDto);
    }

    async signInUser(authCredentialsDto: AuthCredentialsDto): Promise<string> {
        const user = await this.userRespository.signIn(authCredentialsDto);

        if (!user) return null;

        const payload = { username: user.username };
        const accessToken = await this.jwtService.sign(payload);

        return accessToken;
    }
}
