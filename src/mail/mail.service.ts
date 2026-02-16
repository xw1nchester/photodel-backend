import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    constructor(private mailerService: MailerService) {}

    async sendVerificationCode(email: string, code: string) {
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: 'Код подтверждения',
                template: 'verification',
                context: {
                    code
                }
            });

            this.logger.debug(`Письмо успешно отправлено на ${email}`);
        } catch (error) {
            this.logger.error(`Ошибка отправки письма на ${email}`, error);
        }
    }
}
