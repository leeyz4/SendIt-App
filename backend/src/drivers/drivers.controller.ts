/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { JwtAuthGuard } from '../auth/Guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorators';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Public()
  @Post()
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    try {
      const drivers = await this.driversService.findAll();
      return {
        success: true,
        message: 'Drivers retrieved successfully',
        data: drivers
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve drivers',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.driversService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driversService.update(id, updateDriverDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.driversService.updateStatus(id, body.status);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/soft-delete')
  async softDelete(@Param('id') id: string) {
    return this.driversService.softDelete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/hard-delete')
  async hardDelete(@Param('id') id: string) {
    try {
      const result = await this.driversService.hardDelete(id);
      return {
        success: true,
        message: result.message || 'Driver deleted successfully',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to delete driver',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

}
