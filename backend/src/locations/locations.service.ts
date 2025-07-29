import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LocationUpdateDto, Location } from './interface/location.interface';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async updateDriverLocation(locationData: LocationUpdateDto): Promise<Location> {
    try {
      console.log('📍 Updating driver location:', locationData);
      
      // This method is deprecated - use updateParcelLocation instead
      // since ParcelLocationUpdate requires a parcelId
      throw new Error('Use updateParcelLocation instead - requires parcelId');
    } catch (error) {
      console.error('Error updating driver location:', error);
      throw error;
    }
  }

  async updateParcelLocation(parcelId: string, locationData: LocationUpdateDto): Promise<Location> {
    try {
      console.log('📍 Updating parcel location:', parcelId, locationData);
      
      // Save location update to database for specific parcel
      const locationUpdate = await this.prisma.parcelLocationUpdate.create({
        data: {
          parcelId: parcelId,
          updatedBy: locationData.driverId,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          timestamp: new Date(locationData.timestamp),
          locationName: locationData.locationName || null
        }
      });
      
      return {
        id: locationUpdate.id,
        driverId: locationUpdate.updatedBy,
        parcelId: locationUpdate.parcelId,
        latitude: locationUpdate.latitude,
        longitude: locationUpdate.longitude,
        timestamp: locationUpdate.timestamp.toISOString(),
        address: locationUpdate.locationName || undefined
      };
    } catch (error) {
      console.error('Error updating parcel location:', error);
      throw error;
    }
  }

  async getParcelLocationHistory(parcelId: string): Promise<Location[]> {
    try {
      console.log('📍 Getting parcel location history for:', parcelId);
      
      const locationUpdates = await this.prisma.parcelLocationUpdate.findMany({
        where: { parcelId: parcelId },
        orderBy: { timestamp: 'asc' }
      });
      
      return locationUpdates.map(update => ({
        id: update.id,
        driverId: update.updatedBy,
        parcelId: update.parcelId,
        latitude: update.latitude,
        longitude: update.longitude,
        timestamp: update.timestamp.toISOString(),
        address: update.locationName || undefined
      }));
    } catch (error) {
      console.error('Error getting parcel location history:', error);
      throw new NotFoundException('Parcel location history not found');
    }
  }

  async getDriverLocation(driverId: string): Promise<Location> {
    try {
      console.log('📍 Getting driver location for:', driverId);
      
      // Get the most recent location update for this driver
      const latestLocation = await this.prisma.parcelLocationUpdate.findFirst({
        where: { updatedBy: driverId },
        orderBy: { timestamp: 'desc' }
      });
      
      if (latestLocation) {
        return {
          id: latestLocation.id,
          driverId: latestLocation.updatedBy,
          parcelId: latestLocation.parcelId,
          latitude: latestLocation.latitude,
          longitude: latestLocation.longitude,
          timestamp: latestLocation.timestamp.toISOString(),
          address: latestLocation.locationName || undefined
        };
      }
      
      // Return default location if no updates found
      return {
        id: `loc_${Date.now()}`,
        driverId: driverId,
        latitude: -1.286389, // Default to Nairobi
        longitude: 36.817223,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting driver location:', error);
      throw new NotFoundException('Driver location not found');
    }
  }

  async getParcelLocation(parcelId: string): Promise<Location> {
    try {
      // Get the parcel and its assigned driver
      const parcel = await this.prisma.parcel.findFirst({
        where: { id: parcelId, deletedAt: null },
        include: { assignedDriver: true }
      });

      if (!parcel || !parcel.assignedDriverId) {
        throw new NotFoundException('Parcel not found or no driver assigned');
      }

      // Get the most recent location update for this parcel
      const latestLocation = await this.prisma.parcelLocationUpdate.findFirst({
        where: { parcelId: parcelId },
        orderBy: { timestamp: 'desc' }
      });
      
      if (latestLocation) {
        return {
          id: latestLocation.id,
          driverId: latestLocation.updatedBy,
          parcelId: latestLocation.parcelId,
          latitude: latestLocation.latitude,
          longitude: latestLocation.longitude,
          timestamp: latestLocation.timestamp.toISOString(),
          address: latestLocation.locationName || undefined
        };
      }

      // Return default location if no updates found
      return {
        id: `loc_${Date.now()}`,
        driverId: parcel.assignedDriverId,
        parcelId: parcelId,
        latitude: -1.286389, // Default to Nairobi
        longitude: 36.817223,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting parcel location:', error);
      throw new NotFoundException('Parcel location not found');
    }
  }
} 