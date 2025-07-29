import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from './interface/user.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MailerCustomService } from '../mailer/mailer.service';
import { RegisterDto } from 'src/auth/dto/register.dto';
import { UserRole, User as PrismaUser } from 'generated/prisma';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerCustomService,
  ) {}

  private mapPrismaUserToInterface = (user: PrismaUser): User => {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      phone: user.phone ?? undefined,
      isVerified: user.isVerified,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  };

  async createUser(dto: RegisterDto | CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    // Check if this is an admin-created driver (has role field)
    const isAdminCreated = 'role' in dto && dto.role;
    const verificationCode = isAdminCreated ? null : Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    // Log the code for debugging (only for regular users)
    if (!isAdminCreated) {
      console.log('Verification code for', dto.email, ':', verificationCode);
    }

    // Create the user with the role from DTO if provided, default to 'USER'
    const userData: any = {
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: isAdminCreated ? (dto.role as UserRole) : UserRole.USER,
    };

    // Add phone if provided
    if (dto.phone) {
      userData.phone = dto.phone;
    }

    // Add verification code and isVerified status based on creation type
    if (isAdminCreated) {
      // Admin-created drivers are pre-verified
      userData.isVerified = true;
    } else {
      // Regular users need email verification
      userData.verificationCode = verificationCode;
      userData.isVerified = false;
    }

    const user = await this.prisma.user.create({
      data: userData,
    });

    // Send verification email only for regular users
    if (!isAdminCreated) {
      await this.mailerService.sendMail({
        to: dto.email,
        subject: 'Verify your email',
        text: `Your verification code is: ${verificationCode}`,
        html: `<p>Your verification code is: <b>${verificationCode}</b></p>`,
      });
    }

    return user;
  }

  async verifyCode(email: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && user.verificationCode === code) {
      return this.prisma.user.update({
        where: { email },
        data: { isVerified: true, verificationCode: null },
      });
    }
    throw new ForbiddenException('Invalid verification code');
  }

  async findAll(): Promise<User[]> {
    try {
      const users = await this.prisma.user.findMany({
        where: { deletedAt: null },
        orderBy: { id: 'asc' },
      });
      return users.map(this.mapPrismaUserToInterface);
    } catch {
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  async findAllIncludingDeleted(): Promise<User[]> {
    try {
      console.log('Service: Fetching all users including deleted...');
      const users = await this.prisma.user.findMany({
        orderBy: { id: 'asc' },
      });
      console.log('Service: Found', users.length, 'users');
      return users.map(this.mapPrismaUserToInterface);
    } catch (error) {
      console.error('Service: Error fetching users including deleted:', error);
      throw new InternalServerErrorException('Failed to retrieve users including deleted');
    }
  }

  async findByRole(role: UserRole): Promise<User[]> {
    try {
      const users = await this.prisma.user.findMany({
        where: { role },
        orderBy: { id: 'asc' },
      });
      return users.map(this.mapPrismaUserToInterface);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to retrieve users by role: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  async findByIdentifier(email?: string, phone?: string): Promise<User> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { OR: [{ email }, { phone }] },
      });

      if (!user) {
        throw new NotFoundException(
          `User with email ${email} or phone ${phone} not found`,
        );
      }

      return this.mapPrismaUserToInterface(user);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to find user by identifier: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.mapPrismaUserToInterface(user);
  }

  async update(id: string, data: UpdateUserDto): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
      return this.mapPrismaUserToInterface(user);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update user: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  async updateUserRole(id: string, role: UserRole): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          role,
          updatedAt: new Date(),
        },
      });
      return this.mapPrismaUserToInterface(user);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update user role: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new ConflictException('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedNewPassword },
    });

    return { message: 'Password changed successfully' };
  }

  async softDelete(id: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { message: `User ${user.name} has been soft deleted` };
  }

  async hardDelete(id: string): Promise<{ message: string }> {
    try {
      console.log('Service: Hard deleting user with ID:', id);
      const user = await this.prisma.user.findUnique({ 
        where: { id },
        include: {
          parcelsSent: true,
          parcelsReceived: true,
          Notification: true
        }
      });
      
      if (!user) {
        console.log('Service: User not found for hard delete:', id);
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      
      console.log('Service: Found user for hard delete:', user.name);
      console.log('Service: User has parcels sent:', user.parcelsSent.length);
      console.log('Service: User has parcels received:', user.parcelsReceived.length);
      console.log('Service: User has notifications:', user.Notification.length);
      
      // Check if user has any associated data
      if (user.parcelsSent.length > 0 || user.parcelsReceived.length > 0) {
        console.log('Service: Cannot delete user due to parcels');
        throw new ConflictException(`Cannot delete user ${user.name} because they have associated parcels. Please delete the parcels first.`);
      }
      
      if (user.Notification.length > 0) {
        // Delete notifications first
        console.log('Service: Deleting notifications for user');
        await this.prisma.notification.deleteMany({
          where: { userId: id }
        });
        console.log('Service: Deleted notifications for user');
      }
      
      console.log('Service: Proceeding with user deletion');
      await this.prisma.user.delete({ where: { id } });
      console.log('Service: User hard deleted successfully:', user.name);
      const result = { message: `User ${user.name} has been permanently deleted` };
      console.log('Service: Returning result:', result);
      return result;
    } catch (error) {
      console.error('Service: Error in hardDelete:', error);
      console.error('Service: Error type:', typeof error);
      console.error('Service: Error constructor:', error.constructor.name);
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to hard delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async restoreUser(id: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if (!user.deletedAt) {
      throw new ConflictException('User is not deleted');
    }
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: null },
    });
    return { message: `User ${user.name} has been restored` };
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
