import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    return await this.prisma.notification.create({ data: dto });
  }

  async findByUser(userId: string) {
    return await this.prisma.notification.findMany({ where: { userId, deletedAt: null }, orderBy: { sentAt: 'desc' } });
  }

  async markAsRead(id: string) {
    return await this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async softDelete(id: string) {
    const notification = await this.prisma.notification.findFirst({ where: { id, deletedAt: null } });
    if (!notification) throw new NotFoundException('Notification not found');
    await this.prisma.notification.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: `Notification has been soft deleted` };
  }

  async hardDelete(id: string) {
    const notification = await this.prisma.notification.findFirst({ where: { id } });
    if (!notification) throw new NotFoundException('Notification not found');
    await this.prisma.notification.delete({ where: { id } });
    return { message: `Notification has been permanently deleted` };
  }
}
