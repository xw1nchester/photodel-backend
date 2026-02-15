import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterRequestDto } from './dto/register-request.dto';
import { UsersService } from '@users/users.service';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { TokensService } from '@tokens/tokens.service';
import { JwtPayload } from './interfaces';
import { JwtService } from '@nestjs/jwt';
import { LoginRequestDto } from './dto/login-request.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
        private readonly tokensService: TokensService
    ) {}

    private async generateTokens(payload: JwtPayload, userAgent: string) {
        const accessToken = this.jwtService.sign(payload);

        const refreshToken = await this.tokensService.getRefreshToken(
            payload.id,
            userAgent
        );

        return { accessToken, refreshToken };
    }

    // TODO: транзакция
    async register(dto: RegisterRequestDto, userAgent: string) {
        const existingUser = await this.usersService.findByEmail(dto.email);

        if (existingUser) {
            throw new BadRequestException(
                'Пользователь с таким email уже зарегистрирован'
            );
        }

        dto.password = hashSync(dto.password, genSaltSync(10));

        const createdUser = await this.usersService.createUser(dto);

        const tokens = await this.generateTokens(
            { id: createdUser.id },
            userAgent
        );

        // TODO: generate code
        // TODO: send email

        return { user: this.usersService.createDto(createdUser), tokens };
    }

    // TODO: транзакция
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

    async logout(token: string) {
        if (token) {
            await this.tokensService.deleteRefreshToken(token);
        }
    }
}
