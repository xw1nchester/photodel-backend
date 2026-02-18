import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { FastifyReply } from 'fastify';

import { Token } from '@tokens/tokens.entity';

import { AuthService } from './auth.service';
import { Cookie, CurrentUser, Public, UserAgent } from './decorators';
import { AuthResponseDto } from './dto/auth-response.dto';
import { CodeRequestDto } from './dto/code-request.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { JwtPayload } from './interfaces';

const REFRESH_TOKEN = 'refresh-token';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService
    ) {}

    private setRefreshTokenToCookie(
        @Res() reply: FastifyReply,
        token: Token
    ) {
        reply.setCookie(REFRESH_TOKEN, token.token, {
            httpOnly: true,
            sameSite: 'lax',
            expires: token.expiryDate,
            secure:
                this.configService.get('NODE_ENV', 'development') ===
                'production',
            path: '/'
        });
    }

    @Public()
    @Post('register')
    @ApiCreatedResponse({ type: AuthResponseDto })
    async register(
        @Body() dto: RegisterRequestDto,
        @UserAgent() userAgent: string,
        @Res() reply: FastifyReply
    ) {
        const { user, tokens } = await this.authService.register(
            dto,
            userAgent
        );

        const { accessToken, refreshToken } = tokens;

        this.setRefreshTokenToCookie(reply, refreshToken);

        reply.send({ user, accessToken });
    }

    @Public()
    @Post('login')
    @ApiCreatedResponse({ type: AuthResponseDto })
    async login(
        @Body() dto: LoginRequestDto,
        @UserAgent() userAgent: string,
        @Res() reply: FastifyReply
    ) {
        const { user, tokens } = await this.authService.login(dto, userAgent);

        const { accessToken, refreshToken } = tokens;

        this.setRefreshTokenToCookie(reply, refreshToken);

        reply.send({ user, accessToken });
    }

    @Public()
    @Get('refresh')
    @ApiOkResponse({ type: TokenResponseDto })
    async refresh(
        @Cookie(REFRESH_TOKEN) token: string,
        @UserAgent() userAgent: string,
        @Res() reply: FastifyReply
    ) {
        const { refreshToken, accessToken } = await this.authService.refresh(
            token,
            userAgent
        );

        this.setRefreshTokenToCookie(reply, refreshToken);

        reply.send({ accessToken });
    }

    @Public()
    @Get('logout')
    async logout(
        @Cookie(REFRESH_TOKEN) token: string,
        @Res() reply: FastifyReply
    ) {
        await this.authService.logout(token);
        reply.clearCookie(REFRESH_TOKEN).status(200).send();
    }

    @Get('resend-verification')
    async resendVerificationCode(@CurrentUser() user: JwtPayload) {
        await this.authService.resendVerificationCode(user.id);
        return HttpStatus.OK;
    }

    @Post('verify-email')
    async verifyEmail(
        @Body() { code }: CodeRequestDto,
        @CurrentUser() user: JwtPayload
    ) {
        await this.authService.verifyEmail(code, user.id);
        return HttpStatus.OK;
    }
}
