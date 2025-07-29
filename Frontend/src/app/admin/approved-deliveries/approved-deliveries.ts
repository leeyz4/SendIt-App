import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebar } from '../../shared/admin-sidebar/admin-sidebar';
import { ParcelService } from '../../services/parcel.service';
import { DriverService } from '../../services/driver.service';
import { AlertService } from '../../services/alert.service';
import { Parcel } from '../../models/parcels';
import { Driver } from '../../models/drivers';

@Component({
  selector: 'app-approved-deliveries',
  standalone: true,
  imports: [FormsModule, CommonModule, AdminSidebar],
  templateUrl: './approved-deliveries.html',
  styleUrl: './approved-deliveries.css'
})
export class ApprovedDeliveries implements OnInit {
  approvedDeliveries: Parcel[] = [];
  availableDrivers: Driver[] = [];
  loading = false;
  error = '';
  showAssignmentModal = false;
  selectedDelivery: Parcel | null = null;
  selectedDriverId = '';

  constructor(
    private parcelService: ParcelService,
    private driverService: DriverService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.loadApprovedDeliveries();
    this.loadAvailableDrivers();
  }

  loadApprovedDeliveries() {
    this.loading = true;
    this.error = '';
    
    this.parcelService.getApprovedParcels().subscribe({
      next: (deliveries: Parcel[]) => {
        this.approvedDeliveries = deliveries;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading approved deliveries:', err);
        this.error = 'Failed to load approved deliveries. Please try again.';
        this.loading = false;
        this.approvedDeliveries = [];
      }
    });
  }

  loadAvailableDrivers() {
    this.driverService.getDrivers().subscribe({
      next: (response: any) => {
        // Handle different response formats
        let drivers: Driver[] = [];
        if (Array.isArray(response)) {
          drivers = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          drivers = response.data;
        } else if (response && response.success && response.data && Array.isArray(response.data)) {
          drivers = response.data;
        }
        
        this.availableDrivers = drivers.filter(driver => driver.status === 'active');
      },
      error: (err) => {
        console.error('Error loading drivers:', err);
        this.availableDrivers = [];
      }
    });
  }

  getApprovalStatusBadgeClass(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower === 'approved') return 'status-approved';
    if (statusLower === 'pending_approval') return 'status-pending';
    if (statusLower === 'rejected') return 'status-rejected';
    return '';
  }

  getStatusBadgeClass(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending') return 'status-pending';
    if (statusLower === 'delivered') return 'status-delivered';
    if (statusLower === 'in_transit' || statusLower === 'in transit') return 'status-in-transit';
    if (statusLower === 'cancelled') return 'status-cancelled';
    if (statusLower === 'picked_up' || statusLower === 'picked up') return 'status-picked-up';
    return '';
  }

  assignDriver(delivery: Parcel) {
    this.selectedDelivery = delivery;
    this.selectedDriverId = '';
    this.showAssignmentModal = true;
  }

  cancelAssignment() {
    this.showAssignmentModal = false;
    this.selectedDelivery = null;
    this.selectedDriverId = '';
  }

  confirmAssignment() {
    if (!this.selectedDelivery || !this.selectedDriverId) {
      return;
    }

    this.loading = true;
    
    this.parcelService.assignDriverToParcel(this.selectedDelivery.id, this.selectedDriverId).subscribe({
      next: (response) => {
        // Update the delivery in the local array
        const index = this.approvedDeliveries.findIndex(d => d.id === this.selectedDelivery!.id);
        if (index !== -1) {
          this.approvedDeliveries[index] = {
            ...this.approvedDeliveries[index],
            assignedDriverId: this.selectedDriverId,
            assignedDriver: this.availableDrivers.find(d => d.id === this.selectedDriverId)
          };
        }
        
        this.showAssignmentModal = false;
        this.selectedDelivery = null;
        this.selectedDriverId = '';
        this.loading = false;
        
        console.log('Driver assigned successfully');
        this.alertService.success('Driver assigned successfully');
      },
      error: (err) => {
        console.error('Error assigning driver:', err);
        this.loading = false;
        this.alertService.error('Failed to assign driver. Please try again.');
      }
    });
  }
} 