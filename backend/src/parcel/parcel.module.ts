import { Module } from '@nestjs/common';
import { ParcelService } from './parcel.service';
import { ParcelController } from './parcel.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailerCustomModule } from '../mailer/mailer.module';

@Module({
  imports: [MailerCustomModule],
  controllers: [ParcelController],
  providers: [ParcelService, PrismaService],
})
export class ParcelModule {}
