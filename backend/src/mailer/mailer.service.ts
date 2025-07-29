import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerCustomService {
    constructor(private readonly mailerService: MailerService) {}

    async sendMail(options: any) {
        return this.mailerService.sendMail(options);
    }
}
