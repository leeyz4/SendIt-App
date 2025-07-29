/* eslint-disable prettier/prettier */
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApprovalStatus } from './create-parcel.dto';

export class ApproveParcelDto {
  @IsEnum(ApprovalStatus)
  approvalStatus: ApprovalStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
} 