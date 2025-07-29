/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { UsersModule } from '../users/users.module';
// import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
// import { MailerCustomService } from '../mailer/mailer.service';
// import { MailerService } from '@nestjs-modules/mailer'
import { MailerCustomModule } from '../mailer/mailer.module';
// import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PassportModule,
    MailerCustomModule,
    UsersModule,
   // MailerModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1d' 
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy, PrismaService ],
  controllers: [AuthController],
  exports: [AuthService ],
})
export class AuthModule {}
