/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { DriversModule } from './drivers/drivers.module';
import { NotificationModule } from './notification/notification.module';
import { ParcelModule } from './parcel/parcel.module';
import { LocationsModule } from './locations/locations.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    DriversModule,
    NotificationModule,
    ParcelModule,
    LocationsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
