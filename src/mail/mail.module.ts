import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
    imports: [
        MailerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                transport: {
                    host: configService.get('SMTP_HOST'),
                    port: configService.get('SMTP_PORT'),
                    auth: {
                        user: configService.get('SMTP_USERNAME'),
                        pass: configService.get('SMTP_PASSWORD')
                    }
                },
                defaults: {
                    from: configService.get('SMTP_FROM')
                },
                template: {
                    dir: join(process.cwd(), 'src', 'mail', 'templates'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true
                    }
                }
            })
        })
    ],
    providers: [MailService],
    exports: [MailService]
})
export class MailModule {}
