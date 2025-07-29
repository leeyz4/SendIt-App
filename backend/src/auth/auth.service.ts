import {
  Injectable,
  ForbiddenException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyCodeDto } from './dto/verify.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
// import { TokenPayload } from './interfaces/token-payload.interface';
// import { Public } from './decorators/roles.decorator';
import { MailerCustomService } from 'src/mailer/mailer.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailerService: MailerCustomService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { ...result } = user;
      return result;
    }
    return null;
  }

  async register(dto: RegisterDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (user) throw new ConflictException('Email already exists');
    return this.usersService.createUser(dto);
  }

  async verifyCode(dto: VerifyCodeDto) {
    return this.usersService.verifyCode(dto.email, dto.code);
  }

  async resendVerificationCode(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new ConflictException('User is already verified');
    }

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Update user with new verification code
    await this.prisma.user.update({
      where: { email },
      data: { verificationCode },
    });

    // Send new verification email
    await this.mailerService.sendMail({
      to: email,
      subject: 'Verify your email - New Code',
      text: `Your new verification code is: ${verificationCode}`,
      html: `<p>Your new verification code is: <b>${verificationCode}</b></p>`,
    });

    return { message: 'New verification code sent to your email.' };
  }

  async login(dto: LoginDto) {
    console.log('🔐 Login attempt for email:', dto.email);
    
    // First try to find user in User table
    let user = await this.usersService.findByEmail(dto.email);
    let isDriver = false;

    console.log('👤 User found in User table:', user ? 'Yes' : 'No');

    // If not found in User table, check Driver table
    if (!user) {
      const driver = await this.prisma.driver.findUnique({
        where: { email: dto.email }
      });
      
      console.log('🚗 Driver found in Driver table:', driver ? 'Yes' : 'No');
      
      if (driver) {
        console.log('🚗 Driver details:', { id: driver.id, name: driver.name, email: driver.email, status: driver.status });
        
        // Convert driver to user format for consistency
        user = {
          id: driver.id,
          name: driver.name,
          email: driver.email,
          password: driver.password,
          role: 'DRIVER',
          isVerified: true,
          phone: driver.phone,
          verificationCode: null,
          resetToken: null,
          resetTokenExpiry: null,
          createdAt: driver.createdAt,
          updatedAt: driver.updatedAt,
          deletedAt: driver.deletedAt
        };
        isDriver = true;
      }
    }

    if (!user) {
      console.log('❌ No user or driver found with email:', dto.email);
      throw new ForbiddenException('Wrong credentials');
    }

    console.log('✅ User/Driver found:', { id: user.id, name: user.name, role: user.role, isVerified: user.isVerified });

    // Allow admin and driver users to login without email verification
    if (user.role !== 'ADMIN' && user.role !== 'DRIVER' && !user.isVerified) {
      console.log('❌ User not verified and not admin/driver');
      throw new ForbiddenException('Please verify your email before logging in');
    }

    console.log('🔑 Attempting password validation...');
    console.log('🔑 Input password length:', dto.password.length);
    console.log('🔑 Stored password hash:', user.password.substring(0, 20) + '...');
    
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    console.log('🔑 Password validation result:', isPasswordValid ? 'Success' : 'Failed');
    
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', user.email);
      console.log('❌ Input password:', dto.password);
      throw new ForbiddenException('Wrong credentials');
    }

    // Check if driver is active (for drivers from Driver table)
    if (isDriver && user.deletedAt) {
      console.log('❌ Driver is deleted:', user.email);
      throw new ForbiddenException('Driver account is deactivated');
    }

    // Create JWT payload
    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    console.log('✅ Login successful for:', user.email, 'Role:', user.role);

    return {
      message: 'Login successful',
      access_token,
      user,
    };
  }

  async sendResetPasswordEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    const token = randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes
    await this.prisma.user.update({
      where: { email },
      data: { resetToken: token, resetTokenExpiry: expiry },
    });
    // Send real email
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password Reset',
      text: `Reset your password: http://localhost:3000/reset-password?token=${token}`,
      html: `<p>Reset your password: <a href="http://localhost:3000/reset-password?token=${token}">Click here</a></p>`,
    });
    return { message: 'Password reset link sent to your email.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });
    if (!user) throw new ForbiddenException('Invalid or expired reset token');
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    return { message: 'Password has been reset successfully.' };
  }
}
