import { Controller, Get, Body, Post, ValidationPipe, Req, UseGuards } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ) {}

    @Post('signup')
    signUp(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto): Promise<User> {
        return this.authService.signUpUser(authCredentialsDto)
    }

    @Post('signin')
    async signIn(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto): Promise<{ success: boolean, accessToken: string }> {
        const accessToken = await this.authService.signInUser(authCredentialsDto);
        if (!accessToken) return { success: false, accessToken: '' };

        return { success: true, accessToken };
    }

    @Post('test')
    @UseGuards(AuthGuard())
    test(@Req() req) {
        console.log(req);
    }
}
