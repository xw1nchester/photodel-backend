import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { STRATEGIES } from './strategies';
import { GUARDS } from './guards';
import { UsersModule } from '@users/users.module';
import { TokensModule } from '@tokens/tokens.module';

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET'),
                signOptions: {
                    expiresIn: configService.get('JWT_EXP')
                }
            })
        }),
        UsersModule,
        TokensModule
    ],
    controllers: [AuthController],
    providers: [AuthService, ...STRATEGIES, ...GUARDS]
})
export class AuthModule {}
