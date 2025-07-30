import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DriverSidebar } from '../../shared/driver-sidebar/driver-sidebar';
import { ParcelService } from '../../services/parcel.service';
import { AuthService } from '../../services/auth';
import { DeliveryStatusService } from '../../services/delivery-status.service';
import { ToastService } from '../../services/toast.service';
import { Parcel } from '../../models/parcels';

@Component({
  selector: 'app-driver-deliveries',
  standalone: true,
  imports: [CommonModule, FormsModule, DriverSidebar],
  templateUrl: './driver-deliveries.html',
  styleUrl: './driver-deliveries.css'
})
export class DriverDeliveries implements OnInit {
  parcels: Parcel[] = [];
  loading = false;
  error = '';
  selectedStatus = '';
  searchTerm = '';
  driverId = '';

  constructor(
    private parcelService: ParcelService,
    private authService: AuthService,
    private deliveryStatusService: DeliveryStatusService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    // Get driver ID from current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.driverId = currentUser.id;
    
    if (!this.driverId) {
      this.error = 'Driver ID not found. Please login again.';
      return;
    }
    
    this.loadDeliveries();
    
    // Refresh data every 30 seconds to catch new assignments
    setInterval(() => {
      this.loadDeliveries();
    }, 30000);
  }

  loadDeliveries() {
    this.loading = true;
    this.error = '';
    
    // Try the dedicated API first
    this.parcelService.getParcelsByDriver(this.driverId).subscribe({
      next: (parcels) => {
        
        // Debug: Check what assignedDriverId values exist
        
        // Filter to ensure only assigned parcels are shown
        this.parcels = parcels.filter(p => p.assignedDriverId === this.driverId);
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error with getParcelsByDriver API:', err);
        
        // Fallback: get all parcels and filter locally
        this.parcelService.getParcels().subscribe({
          next: (allParcels) => {
            this.parcels = allParcels.filter(p => p.assignedDriverId === this.driverId);
            this.loading = false;
          },
          error: (fallbackErr) => {
            console.error('Error with fallback API:', fallbackErr);
            this.error = 'Failed to load deliveries. Please try again.';
            this.loading = false;
            this.parcels = [];
          }
        });
      }
    });
  }

  get filteredParcels() {
    return this.parcels.filter(p => {
      const matchesSearch = !this.searchTerm || 
        p.trackingId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.pickupLocation.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.destination.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.selectedStatus || p.status === this.selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }

  updateStatus(parcel: Parcel) {
    this.parcelService.updateParcelStatus(parcel.id, parcel.status).subscribe({
      next: (updatedParcel) => {
        // Update the parcel in the local array
        const index = this.parcels.findIndex(p => p.id === parcel.id);
        if (index !== -1) {
          this.parcels[index] = updatedParcel;
        }
        
        // Show success message with email notification info
        const statusName = this.getStatusDisplayName(parcel.status);
        this.toastService.success(`✅ Parcel ${parcel.trackingId} status updated to ${statusName}\n\n📧 Email notification sent to recipient`);
      },
      error: (err) => {
        console.error('Error updating parcel status:', err);
        this.toastService.error('Failed to update parcel status. Please try again.');
      }
    });
  }

  pickUpParcel(parcel: Parcel) {
    if (confirm(`Are you sure you want to pick up parcel ${parcel.trackingId}?\n\n📧 This will send an email notification to the recipient.`)) {
      parcel.status = 'PICKED_UP';
      this.updateStatus(parcel);
    }
  }

  startDelivery(parcel: Parcel) {
    if (confirm(`Are you sure you want to start delivery for parcel ${parcel.trackingId}?\n\n📧 This will send an email notification to the recipient.`)) {
      parcel.status = 'IN_TRANSIT';
      this.updateStatus(parcel);
    }
  }

  completeDelivery(parcel: Parcel) {
    if (confirm(`Are you sure you want to mark parcel ${parcel.trackingId} as delivered?\n\n📧 This will send an email notification to the recipient.`)) {
      parcel.status = 'DELIVERED';
      this.updateStatus(parcel);
      
      // Notify other components that a delivery was completed
      this.deliveryStatusService.notifyDeliveryCompleted(parcel.id);
    }
  }

  getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending') return 'status-pending';
    if (statusLower === 'delivered') return 'status-delivered';
    if (statusLower === 'in_transit' || statusLower === 'in transit') return 'status-in-transit';
    if (statusLower === 'cancelled') return 'status-cancelled';
    if (statusLower === 'picked_up' || statusLower === 'picked up') return 'status-picked-up';
    return '';
  }

  getStatusDisplayName(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending') return 'Pending';
    if (statusLower === 'delivered') return 'Delivered';
    if (statusLower === 'in_transit' || statusLower === 'in transit') return 'In Transit';
    if (statusLower === 'cancelled') return 'Cancelled';
    if (statusLower === 'picked_up' || statusLower === 'picked up') return 'Picked Up';
    return status;
  }

  getDeliveryCount(): number {
    return this.parcels.length;
  }

  getActiveDeliveries(): number {
    return this.parcels.filter(p => p.status !== 'DELIVERED').length;
  }

  getCompletedDeliveries(): number {
    return this.parcels.filter(p => p.status === 'DELIVERED').length;
  }

  refreshDeliveries() {
    this.loadDeliveries();
  }
} 