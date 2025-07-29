import {
  Controller,
  Post,
  Get,
  Param,
  Patch,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/Guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorators';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a notification' })
  create(@Body() dto: CreateNotificationDto) {
    return this.notificationService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  @ApiOperation({ summary: 'Get all notifications for a user' })
  findByUser(@Param('userId') userId: string) {
    return this.notificationService.findByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/soft-delete')
  async softDelete(@Param('id') id: string) {
    return this.notificationService.softDelete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/hard-delete')
  async hardDelete(@Param('id') id: string) {
    return this.notificationService.hardDelete(id);
  }
}
