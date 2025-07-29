/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParcelDto, ParcelStatus, ApprovalStatus } from './dto/create-parcel.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
import { ApproveParcelDto } from './dto/approve-parcel.dto';

@Injectable()
export class ParcelService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateParcelDto) {
    return await this.prisma.parcel.create({ 
      data,
      include: {
        sender: { select: { id: true, name: true, email: true } },
        recipient: { select: { id: true, name: true, email: true } }
      }
    });
  }

  async findAll() {
    return await this.prisma.parcel.findMany({ 
      where: { deletedAt: null },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        recipient: { select: { id: true, name: true, email: true } },
        assignedDriver: { select: { id: true, name: true, email: true } }
      }
    });
  }

  async findPendingApprovals() {
    return await this.prisma.parcel.findMany({ 
      where: { 
        deletedAt: null,
        approvalStatus: ApprovalStatus.PENDING_APPROVAL
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        recipient: { select: { id: true, name: true, email: true } },
        assignedDriver: { select: { id: true, name: true, email: true } }
      }
    });
  }

  async findApprovedParcels() {
    return await this.prisma.parcel.findMany({ 
      where: { 
        deletedAt: null,
        approvalStatus: ApprovalStatus.APPROVED
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        recipient: { select: { id: true, name: true, email: true } },
        assignedDriver: { select: { id: true, name: true, email: true } }
      }
    });
  }

  // Get parcels where the user is the sender
  async findParcelsBySender(userId: string) {
    return await this.prisma.parcel.findMany({ 
      where: { 
        senderId: userId,
        deletedAt: null
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        recipient: { select: { id: true, name: true, email: true } },
        assignedDriver: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get parcels where the user is the recipient
  async findParcelsByRecipient(userId: string) {
    return await this.prisma.parcel.findMany({ 
      where: { 
        recipientId: userId,
        deletedAt: null
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        recipient: { select: { id: true, name: true, email: true } },
        assignedDriver: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get all parcels for a user (both sent and received)
  async findParcelsForUser(userId: string) {
    return await this.prisma.parcel.findMany({ 
      where: { 
        OR: [
          { senderId: userId },
          { recipientId: userId }
        ],
        deletedAt: null
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        recipient: { select: { id: true, name: true, email: true } },
        assignedDriver: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get pending approvals for a specific user (where they are the sender)
  async findPendingApprovalsForUser(userId: string) {
    return await this.prisma.parcel.findMany({ 
      where: { 
        senderId: userId,
        deletedAt: null,
        approvalStatus: ApprovalStatus.PENDING_APPROVAL
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        recipient: { select: { id: true, name: true, email: true } },
        assignedDriver: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    const parcel = await this.prisma.parcel.findFirst({ 
      where: { id, deletedAt: null },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        recipient: { select: { id: true, name: true, email: true } },
        assignedDriver: { select: { id: true, name: true, email: true } }
      }
    });
    if (!parcel) throw new NotFoundException('Parcel not found');
    return parcel;
  }

  async updateStatus(id: string, dto: UpdateParcelDto) {
    return await this.prisma.parcel.update({
      where: { id },
      data: { status: dto.status as ParcelStatus, updatedAt: new Date() },
    });
  }

  async approveParcel(id: string, dto: ApproveParcelDto) {
    const parcel = await this.prisma.parcel.findFirst({ 
      where: { id, deletedAt: null } 
    });
    
    if (!parcel) {
      throw new NotFoundException('Parcel not found');
    }

    if (parcel.approvalStatus !== ApprovalStatus.PENDING_APPROVAL) {
      throw new Error('Parcel is not pending approval');
    }

    return await this.prisma.parcel.update({
      where: { id },
      data: { 
        approvalStatus: dto.approvalStatus,
        rejectionReason: dto.rejectionReason,
        updatedAt: new Date() 
      },
    });
  }

  async findRejectedParcels() {
    return await this.prisma.parcel.findMany({ 
      where: { 
        deletedAt: null,
        approvalStatus: ApprovalStatus.REJECTED
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        recipient: { select: { id: true, name: true, email: true } },
        assignedDriver: { select: { id: true, name: true, email: true } }
      }
    });
  }

  async resubmitParcel(id: string, dto: UpdateParcelDto) {
    try {
      const parcel = await this.prisma.parcel.findFirst({ 
        where: { id, deletedAt: null } 
      });
      
      if (!parcel) {
        throw new NotFoundException('Parcel not found');
      }

      if (parcel.approvalStatus !== ApprovalStatus.REJECTED) {
        throw new Error('Parcel is not rejected');
      }

      // Validate required fields
      if (!dto.description || !dto.weight || !dto.price || !dto.pickupLocation || !dto.destination) {
        throw new Error('Missing required fields for resubmission');
      }

      return await this.prisma.parcel.update({
        where: { id },
        data: { 
          description: dto.description,
          weight: dto.weight,
          price: dto.price,
          pickupLocation: dto.pickupLocation,
          destination: dto.destination,
          deliveryDate: dto.deliveryDate,
          approvalStatus: ApprovalStatus.PENDING_APPROVAL,
          rejectionReason: null, // Clear rejection reason
          updatedAt: new Date() 
        },
      });
    } catch (error) {
      console.error('Error resubmitting parcel:', error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateParcelDto) {
    try {
      // Check if parcel exists
      const existingParcel = await this.prisma.parcel.findFirst({ 
        where: { id, deletedAt: null } 
      });
      
      if (!existingParcel) {
        throw new NotFoundException('Parcel not found');
      }

      // If assigning a driver, check if driver exists
      if (dto.assignedDriverId) {
        const driver = await this.prisma.driver.findFirst({
          where: { 
            id: dto.assignedDriverId, 
            status: 'active',
            deletedAt: null 
          }
        });
        
        if (!driver) {
          throw new NotFoundException('Driver not found or not active');
        }
      }

      return await this.prisma.parcel.update({
        where: { id },
        data: { 
          ...dto, 
          updatedAt: new Date() 
        },
      });
    } catch (error) {
      console.error('Error updating parcel:', error);
      throw error;
    }
  }

  async softDelete(id: string) {
    const parcel = await this.prisma.parcel.findFirst({ where: { id, deletedAt: null } });
    if (!parcel) throw new NotFoundException('Parcel not found');
    await this.prisma.parcel.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: `Parcel ${parcel.trackingId} has been soft deleted` };
  }

  async hardDelete(id: string) {
    const parcel = await this.prisma.parcel.findFirst({ where: { id } });
    if (!parcel) throw new NotFoundException('Parcel not found');
    await this.prisma.parcel.delete({ where: { id } });
    return { message: `Parcel ${parcel.trackingId} has been permanently deleted` };
  }

  async findByTrackingId(trackingId: string) {
    try {
      const parcel = await this.prisma.parcel.findUnique({
        where: { trackingId },
        include: {
          sender: true,
          recipient: true,
          assignedDriver: true,
          locationUpdates: {
            orderBy: { timestamp: 'desc' }
          }
        }
      });

      if (!parcel) {
        return {
          success: false,
          message: 'Parcel not found',
          data: null
        };
      }

      return {
        success: true,
        message: 'Parcel found successfully',
        data: parcel
      };
    } catch (error) {
      console.error('Error finding parcel by tracking ID:', error);
      return {
        success: false,
        message: 'Failed to find parcel',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
