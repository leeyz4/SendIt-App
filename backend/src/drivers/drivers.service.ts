/* eslint-disable prettier/prettier */
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDriverDto) {
    console.log('🚗 Creating driver with email:', dto.email);
    
    const existing = await this.prisma.driver.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      console.log('❌ Driver with email already exists:', dto.email);
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    console.log('🔑 Password hashed successfully');
    console.log('🔑 Original password length:', dto.password.length);
    console.log('🔑 Hashed password preview:', hashedPassword.substring(0, 20) + '...');
    
    // Remove confirmPassword from dto before creating driver
    const { confirmPassword, ...driverData } = dto as any;
    
    const driver = await this.prisma.driver.create({
      data: {
        ...driverData,
        password: hashedPassword,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    
    console.log('✅ Driver created successfully:', { id: driver.id, name: driver.name, email: driver.email });
    return driver;
  }

  async findAll() {
    console.log('🔍 Finding all drivers...');
    const drivers = await this.prisma.driver.findMany({ where: { deletedAt: null } });
    console.log(`📊 Found ${drivers.length} drivers:`, drivers);
    return drivers;
  }

  async findOne(id: string) {
    const driver = await this.prisma.driver.findFirst({ where: { id, deletedAt: null } });
    if (!driver) throw new NotFoundException('Driver not found');
    return driver;
  }

  async update(id: string, dto: UpdateDriverDto) {
    return await this.prisma.driver.update({
      where: { id },
      data: { ...dto, updatedAt: new Date() },
    });
  }

  async updateStatus(id: string, status: string) {
    const driver = await this.prisma.driver.findUnique({ where: { id } });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    // If driver is being deactivated, remove them from all assigned parcels
    if (status === 'inactive' && driver.status === 'active') {
      await this.prisma.parcel.updateMany({
        where: { assignedDriverId: id },
        data: { assignedDriverId: null }
      });
    }

    return await this.prisma.driver.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });
  }

  async softDelete(id: string) {
    const driver = await this.prisma.driver.findFirst({ where: { id, deletedAt: null } });
    if (!driver) throw new NotFoundException('Driver not found');
    await this.prisma.driver.update({ where: { id }, data: { status: 'inactive', deletedAt: new Date() } });
    return { message: `Driver ${driver.name} has been soft deleted` };
  }

  async hardDelete(id: string) {
    const driver = await this.prisma.driver.findFirst({ where: { id } });
    if (!driver) throw new NotFoundException('Driver not found');
    await this.prisma.driver.delete({ where: { id } });
    return { message: `Driver ${driver.name} has been permanently deleted` };
  }
}
