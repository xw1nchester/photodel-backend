import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

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

            this.logger.debug(`Email was successfully sent to ${email}`);
        } catch (error) {
            this.logger.error(`Error sending email to ${email}`, error);
        }
    }
}
