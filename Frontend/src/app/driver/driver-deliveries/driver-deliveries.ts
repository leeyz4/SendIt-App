import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DriverSidebar } from '../../shared/driver-sidebar/driver-sidebar';
import { ParcelService } from '../../services/parcel.service';
import { AuthService } from '../../services/auth';
import { DeliveryStatusService } from '../../services/delivery-status.service';
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
    private deliveryStatusService: DeliveryStatusService
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
  }

  loadDeliveries() {
    this.loading = true;
    this.error = '';
    
    this.parcelService.getParcels().subscribe({
      next: (parcels) => {
        // Filter parcels assigned to this driver
        this.parcels = parcels.filter(p => p.assignedDriverId === this.driverId);
        console.log('📦 Loaded deliveries for driver:', this.driverId, 'Count:', this.parcels.length);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading deliveries:', err);
        this.error = 'Failed to load deliveries. Please try again.';
        this.loading = false;
        this.parcels = [];
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
        console.log('Status updated for parcel:', parcel.trackingId, 'to:', parcel.status);
        
        // Show success message
        alert(`Parcel ${parcel.trackingId} status updated to ${this.getStatusDisplayName(parcel.status)}`);
      },
      error: (err) => {
        console.error('Error updating parcel status:', err);
        alert('Failed to update parcel status. Please try again.');
      }
    });
  }

  pickUpParcel(parcel: Parcel) {
    if (confirm(`Are you sure you want to pick up parcel ${parcel.trackingId}?`)) {
      parcel.status = 'PICKED_UP';
      this.updateStatus(parcel);
    }
  }

  startDelivery(parcel: Parcel) {
    if (confirm(`Are you sure you want to start delivery for parcel ${parcel.trackingId}?`)) {
      parcel.status = 'IN_TRANSIT';
      this.updateStatus(parcel);
    }
  }

  completeDelivery(parcel: Parcel) {
    if (confirm(`Are you sure you want to mark parcel ${parcel.trackingId} as delivered?`)) {
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
} 