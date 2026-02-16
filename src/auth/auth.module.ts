import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { CodesModule } from '@codes/codes.module';
import { MailModule } from '@mail/mail.module';
import { TokensModule } from '@tokens/tokens.module';
import { UsersModule } from '@users/users.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GUARDS } from './guards';
import { STRATEGIES } from './strategies';


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
        TokensModule,
        CodesModule,
        MailModule
    ],
    controllers: [AuthController],
    providers: [AuthService, ...STRATEGIES, ...GUARDS]
})
export class AuthModule {}
