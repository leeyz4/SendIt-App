/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MailerCustomService } from './mailer.service';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      },
      defaults: {
        from: '"Elizabeth" <elizabethnyanchama04@gmail.com>', // default sender address
      },
    }),
    ConfigModule,
  ],
  providers: [MailerCustomService],
  exports: [MailerCustomService],
})
export class MailerCustomModule {}
