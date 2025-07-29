/* eslint-disable prettier/prettier */
import { IsString, IsUUID, IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum ParcelStatus {
  PENDING = 'PENDING',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum ApprovalStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class CreateParcelDto {
  @IsString()
  trackingId: string;

  @IsString()
  description: string;

  @IsNumber()
  weight: number;

  @IsNumber()
  price: number;

  @IsString()
  pickupLocation: string;

  @IsString()
  destination: string;

  @IsEnum(ParcelStatus)
  status: ParcelStatus;

  @IsOptional()
  deliveryDate?: Date;

  @IsUUID()
  senderId: string;

  @IsUUID()
  recipientId: string;

  @IsOptional()
  @IsUUID()
  assignedDriverId?: string;

  @IsOptional()
  @IsEnum(ApprovalStatus)
  approvalStatus?: ApprovalStatus;
}
