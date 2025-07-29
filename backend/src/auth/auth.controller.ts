import { Controller, Post, Body, Req, Get, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { VerifyCodeDto } from './dto/verify.dto';
import { JwtAuthGuard } from './Guards/jwt-auth.guard';
import { Roles, Public } from './decorators/roles.decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('verify-code')
  async verifyCode(@Body() dto: VerifyCodeDto) {
    return this.authService.verifyCode(dto);
  }

  @Public()
  @Post('resend-verification')
  async resendVerificationCode(@Body('email') email: string) {
    return this.authService.resendVerificationCode(email);
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const { user, access_token } = await this.authService.login(dto);
    return { user, access_token };
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.sendResetPasswordEmail(email);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  @Public()
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.log('User in request:', req.user);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return req.user;
  }

  // @Post('test')
  // // eslint-disable-next-line @typescript-eslint/require-await
  // async test() {
  //   console.log('Test route hit');
  //   return 'This is a public test route';
  // }
}
