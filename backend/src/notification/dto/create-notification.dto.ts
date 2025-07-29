/* eslint-disable prettier/prettier */
import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  message: string;

  @IsString()
  toEmail: string;

  @IsOptional()
  @IsUUID()
  parcelId?: string;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
