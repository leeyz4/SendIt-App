import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { MailerCustomService } from 'src/mailer/mailer.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, MailerCustomService],
  exports: [UsersService],
})
export class UsersModule {}
