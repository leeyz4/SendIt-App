import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebar } from '../../shared/admin-sidebar/admin-sidebar';
import { ParcelService } from '../../services/parcel.service';
import { ToastService } from '../../services/toast.service';
import { Parcel } from '../../models/parcels';

@Component({
  selector: 'app-admin-parcels',
  standalone: true,
  imports: [FormsModule, CommonModule, AdminSidebar],
  templateUrl: './admin-parcels.html',
  styleUrl: './admin-parcels.css'
})
export class AdminParcels implements OnInit {
  searchTerm = '';
  selectedStatus = '';
  parcels: Parcel[] = [];
  loading = false;
  error = '';

  constructor(
    private parcelService: ParcelService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadParcels();
  }

  loadParcels() {
    this.loading = true;
    this.error = '';
    
    this.parcelService.getParcels().subscribe({
      next: (parcels: Parcel[]) => {
        this.parcels = parcels;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading parcels:', err);
        this.error = 'Failed to load parcels. Please try again.';
        this.loading = false;
        this.parcels = [];
      }
    });
  }

  get filteredParcels() {
    const term = this.searchTerm.toLowerCase();
    return this.parcels.filter(p =>
      (p.trackingId.toLowerCase().includes(term) ||
       p.description.toLowerCase().includes(term) ||
       p.pickupLocation.toLowerCase().includes(term) ||
       p.destination.toLowerCase().includes(term)) &&
      (this.selectedStatus && this.selectedStatus !== 'All' ? p.status === this.selectedStatus : true)
    );
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

  clearSearch() {
    this.searchTerm = '';
  }

  updateParcelStatus(parcel: Parcel, newStatus: string) {
    this.parcelService.updateParcelStatus(parcel.id, newStatus).subscribe({
      next: (updatedParcel) => {
        // Update the parcel in the local array
        const index = this.parcels.findIndex(p => p.id === parcel.id);
        if (index !== -1) {
          this.parcels[index] = updatedParcel;
        }
        this.toastService.success('Parcel status updated successfully');
      },
      error: (err) => {
        console.error('Error updating parcel status:', err);
        this.toastService.error('Failed to update parcel status. Please try again.');
      }
    });
  }

  deleteParcel(parcel: Parcel) {
    if (confirm(`Are you sure you want to delete parcel ${parcel.trackingId}?`)) {
      this.parcelService.deleteParcel(parcel.id).subscribe({
        next: () => {
          // Remove the parcel from the local array
          this.parcels = this.parcels.filter(p => p.id !== parcel.id);
          this.toastService.success(`Parcel ${parcel.trackingId} has been deleted successfully.`);
        },
        error: (err) => {
          console.error('Error deleting parcel:', err);
          this.toastService.error('Failed to delete parcel. Please try again.');
        }
      });
    }
  }

  viewParcelDetails(parcel: Parcel) {
    // Show parcel details in a modal or navigate to details page
    const details = `
Parcel Details:
- Tracking ID: ${parcel.trackingId}
- Description: ${parcel.description}
- Weight: ${parcel.weight} kg
- Price: $${parcel.price}
- Pickup: ${parcel.pickupLocation}
- Destination: ${parcel.destination}
- Status: ${this.getStatusDisplayName(parcel.status)}
- Delivery Date: ${parcel.deliveryDate || 'Not set'}
- Created: ${parcel.createdAt}
- Updated: ${parcel.updatedAt}
    `;
    this.toastService.info(details);
  }

  editParcel(parcel: Parcel) {
    // For now, show an alert with edit options
    // In a real app, this would open a modal or navigate to edit page
    const newStatus = prompt(`Edit parcel ${parcel.trackingId}\n\nCurrent status: ${this.getStatusDisplayName(parcel.status)}\n\nEnter new status (PENDING, IN_TRANSIT, DELIVERED, CANCELLED, PICKED_UP):`);
    
    if (newStatus && newStatus !== parcel.status) {
      this.updateParcelStatus(parcel, newStatus);
    }
  }
}
