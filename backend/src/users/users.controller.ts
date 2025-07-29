/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ParseUUIDPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { UserRole } from 'generated/prisma';
import { User } from './interface/user.interface';
import { JwtAuthGuard } from '../auth/Guards/jwt-auth.guard';
import { ApiResult } from '../shared-interface/api-response.interface';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from '../auth/Guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorators';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() data: CreateUserDto): Promise<ApiResult<User>> {
    try {
      const user = await this.usersService.createUser(data);
      return {
        success: true,
        message: 'User created successfully',
        data: {
          ...user,
          phone: user.phone ?? undefined,
          created_at: user.createdAt,
          updated_at: user.updatedAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('Search')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Search user by email or phone' })
  @ApiResponse({ status: 200, description: 'User found successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserByIdentifier(
    @Query('email') email?: string,
    @Query('phone') phone?: string,
  ): Promise<ApiResult<User>> {
    try {
      if (!email && !phone) {
        throw new BadRequestException(
          'Email or phone number is required to search for a user',
        );
      }

      const user = await this.usersService.findByIdentifier(email, phone);
      return {
        success: true,
        message: 'User found successfully',
        data: user,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          success: false,
          message: 'User not found',
          error: error.message,
        };
      }
      return {
        success: false,
        message: 'Failed to search for user',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  async findAll(): Promise<ApiResult<User[]>> {
    const users = await this.usersService.findAll();
    return { success: true, message: 'Users retrieved successfully', data: users };
  }

  @Get('drivers')
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  async findAllDrivers(): Promise<ApiResult<User[]>> {
    const drivers = await this.usersService.findByRole('DRIVER');
    return { success: true, message: 'Drivers retrieved successfully', data: drivers };
  }

  @Get('all-including-deleted')
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  async findAllIncludingDeleted(): Promise<ApiResult<User[]>> {
    try {
      console.log('Fetching all users including deleted...');
      const users = await this.usersService.findAllIncludingDeleted();
      console.log('Found users:', users.length);
      return { success: true, message: 'Users retrieved successfully', data: users };
    } catch (error) {
      console.error('Error fetching users including deleted:', error);
      return {
        success: false,
        message: 'Failed to retrieve users',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Get a user by ID (admin use) - This must come after specific routes
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<ApiResult<User>> {
    try {
      const user = await this.usersService.findOne(id);
      const { ...userWithoutPassword } = user;
      return {
        success: true,
        message: 'User found',
        data: userWithoutPassword as User,
      };
    } catch (error) {
      return {
        success: false,
        message: 'User not found',
        error: error instanceof Error ? error.message : 'Unknown Error',
      };
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiResult<User>> {
    try {
      console.log('Updating user:', id, 'with data:', updateUserDto);
      const user = await this.usersService.update(id, updateUserDto);
      console.log('User updated successfully:', user);
      console.log('User isVerified status:', user.isVerified);
      return {
        success: true,
        message: 'User updated successfully',
        data: user,
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        message: 'Failed to update user',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update user role' })
  @ApiResponse({ status: 200, description: 'User role updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateRole(
    @Param('id') id: string,
    @Body() body: { role: UserRole },
  ): Promise<ApiResult<User>> {
    try {
      const user = await this.usersService.updateUserRole(id, body.role);
      return {
        success: true,
        message: 'User role updated successfully',
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update user role',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Patch(':id/soft-delete')
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  async softDelete(@Param('id') id: string, @Request() req: any) {
    try {
      console.log('Soft deleting user:', id);
      console.log('Current user from request:', req.user);
      console.log('Current user role:', req.user?.role);
      
      const result = await this.usersService.softDelete(id);
      console.log('User soft deleted successfully:', result);
      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      console.error('Error soft deleting user:', error);
      return {
        success: false,
        message: 'Failed to delete user',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Delete(':id/hard-delete')
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  async hardDelete(@Param('id') id: string) {
    try {
      console.log('Controller: Hard deleting user:', id);
      const result = await this.usersService.hardDelete(id);
      console.log('Controller: Service result:', result);
      console.log('Controller: Result type:', typeof result);
      console.log('Controller: Result message:', result.message);
      
      const response = {
        success: true,
        message: result.message,
      };
      console.log('Controller: Returning response:', response);
      return response;
    } catch (error) {
      console.error('Controller: Error hard deleting user:', error);
      console.error('Controller: Error type:', typeof error);
      console.error('Controller: Error message:', error.message);
      
      const errorResponse = {
        success: false,
        message: 'Failed to hard delete user',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      console.log('Controller: Returning error response:', errorResponse);
      return errorResponse;
    }
  }

  @Patch(':id/restore')
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  async restoreUser(@Param('id') id: string) {
    try {
      const result = await this.usersService.restoreUser(id);
      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to restore user',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string) {
    try {
      const result = await this.usersService.hardDelete(id);
      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete user',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  @Get('test-hard-delete/:id')
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  async testHardDelete(@Param('id') id: string) {
    try {
      console.log('Test: Testing hard delete for user:', id);
      const result = await this.usersService.hardDelete(id);
      console.log('Test: Hard delete result:', result);
      return {
        success: true,
        message: 'Test successful',
        data: result
      };
    } catch (error) {
      console.error('Test: Hard delete error:', error);
      return {
        success: false,
        message: 'Test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
