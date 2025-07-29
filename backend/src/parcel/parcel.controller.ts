/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ParcelService } from './parcel.service';
import { CreateParcelDto } from './dto/create-parcel.dto';
import { UpdateParcelDto } from './dto/update-parcel.dto';
import { ApproveParcelDto } from './dto/approve-parcel.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/Guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorators';

@ApiTags('Parcels')
@Controller('parcels')
export class ParcelController {
  constructor(private readonly parcelService: ParcelService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new parcel' })
  @ApiResponse({ status: 201, description: 'Parcel created' })
  create(@Body() dto: CreateParcelDto) {
    return this.parcelService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all parcels' })
  findAll() {
    return this.parcelService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('pending-approvals')
  @ApiOperation({ summary: 'Get parcels pending approval' })
  findPendingApprovals() {
    return this.parcelService.findPendingApprovals();
  }

  @UseGuards(JwtAuthGuard)
  @Get('approved')
  @ApiOperation({ summary: 'Get approved parcels ready for driver assignment' })
  findApprovedParcels() {
    return this.parcelService.findApprovedParcels();
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId/sent')
  @ApiOperation({ summary: 'Get parcels sent by a specific user' })
  findParcelsBySender(@Param('userId') userId: string) {
    return this.parcelService.findParcelsBySender(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId/received')
  @ApiOperation({ summary: 'Get parcels received by a specific user' })
  findParcelsByRecipient(@Param('userId') userId: string) {
    return this.parcelService.findParcelsByRecipient(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId/all')
  @ApiOperation({ summary: 'Get all parcels for a user (both sent and received)' })
  findParcelsForUser(@Param('userId') userId: string) {
    return this.parcelService.findParcelsForUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:userId/pending-approvals')
  @ApiOperation({ summary: 'Get pending approvals for a specific user' })
  findPendingApprovalsForUser(@Param('userId') userId: string) {
    return this.parcelService.findPendingApprovalsForUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('rejected')
  @ApiOperation({ summary: 'Get rejected parcels that need admin review' })
  findRejectedParcels() {
    return this.parcelService.findRejectedParcels();
  }

  @UseGuards(JwtAuthGuard)
  @Get('tracking/:trackingId')
  @ApiOperation({ summary: 'Get a specific parcel by tracking ID' })
  findByTrackingId(@Param('trackingId') trackingId: string) {
    return this.parcelService.findByTrackingId(trackingId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific parcel' })
  findOne(@Param('id') id: string) {
    return this.parcelService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update parcel status' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateParcelDto) {
    return this.parcelService.updateStatus(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update parcel (assign driver, etc.)' })
  update(@Param('id') id: string, @Body() dto: UpdateParcelDto) {
    return this.parcelService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve or reject a parcel' })
  approveParcel(@Param('id') id: string, @Body() dto: ApproveParcelDto) {
    return this.parcelService.approveParcel(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/resubmit')
  @ApiOperation({ summary: 'Resubmit a rejected parcel after admin updates' })
  resubmitParcel(@Param('id') id: string, @Body() dto: UpdateParcelDto) {
    return this.parcelService.resubmitParcel(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/soft-delete')
  async softDelete(@Param('id') id: string) {
    return this.parcelService.softDelete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/hard-delete')
  async hardDelete(@Param('id') id: string) {
    return this.parcelService.hardDelete(id);
  }

}
