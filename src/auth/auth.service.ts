import {
    BadRequestException,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { DataSource, EntityManager } from 'typeorm';

import { CodesService } from '@codes/codes.service';
import { MailService } from '@mail/mail.service';
import { TokensService } from '@tokens/tokens.service';
import { UsersService } from '@users/users.service';

import { LoginRequestDto } from './dto/login-request.dto';
import { RegisterRequestDto } from './dto/register-request.dto';
import { JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
        private readonly tokensService: TokensService,
        private readonly codesService: CodesService,
        private readonly mailService: MailService
    ) {}

    private async generateTokens(
        payload: JwtPayload,
        userAgent: string,
        manager?: EntityManager
    ) {
        const accessToken = this.jwtService.sign(payload);

        const refreshToken = await this.tokensService.updateOrCreateToken(
            payload.id,
            userAgent,
            manager
        );

        return { accessToken, refreshToken };
    }

    async register(dto: RegisterRequestDto, userAgent: string) {
        return await this.dataSource.transaction(async manager => {
            const existingUser = await this.usersService.findByEmail(
                dto.email,
                manager
            );

            if (existingUser) {
                throw new BadRequestException(
                    'Пользователь с таким email уже зарегистрирован'
                );
            }

            dto.password = hashSync(dto.password, genSaltSync(10));

            const createdUser = await this.usersService.create(dto, manager);

            const tokens = await this.generateTokens(
                { id: createdUser.id },
                userAgent,
                manager
            );

            const code = await this.codesService.createVerificationCode(
                createdUser.id,
                manager
            );

            this.mailService.sendVerificationCode(createdUser.email, code);

            return { user: this.usersService.createDto(createdUser), tokens };
        });
    }

    async login(dto: LoginRequestDto, userAgent: string) {
        const existingUser = await this.usersService.findByEmail(dto.email);

        if (
            !existingUser ||
            !compareSync(dto.password, existingUser.passwordHash)
        ) {
            throw new BadRequestException(
                'Неверное имя пользователя или пароль'
            );
        }

        const tokens = await this.generateTokens(
            { id: existingUser.id },
            userAgent
        );

        return { user: this.usersService.createDto(existingUser), tokens };
    }

    async refresh(token: string, userAgent: string) {
        if (!token) {
            throw new UnauthorizedException();
        }

        const tokenData = await this.tokensService.findToken(token);

        if (!tokenData || new Date(tokenData.expiryDate) < new Date()) {
            throw new UnauthorizedException();
        }

        // const user = await this.usersService.findById(tokenData.user.id);

        return this.generateTokens({ id: tokenData.user.id }, userAgent);
    }

    async logout(token: string) {
        if (token) {
            await this.tokensService.deleteToken(token);
        }
    }

    async resendVerificationCode(userId: number) {
        const { isVerified, email } = await this.usersService.findById(userId);

        if (isVerified) {
            throw new BadRequestException('Ваш аккаунт уже верифицирован');
        }

        const code = await this.codesService.createVerificationCode(userId);

        this.mailService.sendVerificationCode(email, code);
    }

    async verifyEmail(code: string, userId: number) {
        return await this.dataSource.transaction(async manager => {
            const { isVerified } = await this.usersService.findById(userId);

            if (isVerified) {
                throw new BadRequestException('Ваш аккаунт уже верифицирован');
            }

            await this.codesService.validateVerificationCode(
                code,
                userId,
                manager
            );

            await this.usersService.verifyById(userId, manager);
        });
    }
}
