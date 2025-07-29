import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { JwtAuthGuard } from '../auth/Guards/jwt-auth.guard';
import { LocationUpdateDto, Location } from './interface/location.interface';

@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post('parcel/:parcelId')
  async updateParcelLocation(
    @Param('parcelId') parcelId: string,
    @Body() locationData: LocationUpdateDto
  ) {
    return this.locationsService.updateParcelLocation(parcelId, locationData);
  }

  @Get('driver/:driverId')
  async getDriverLocation(@Param('driverId') driverId: string) {
    return this.locationsService.getDriverLocation(driverId);
  }

  @Get('parcel/:parcelId')
  async getParcelLocation(@Param('parcelId') parcelId: string) {
    return this.locationsService.getParcelLocation(parcelId);
  }

  @Get('parcel/:parcelId/history')
  async getParcelLocationHistory(@Param('parcelId') parcelId: string) {
    return this.locationsService.getParcelLocationHistory(parcelId);
  }
} 