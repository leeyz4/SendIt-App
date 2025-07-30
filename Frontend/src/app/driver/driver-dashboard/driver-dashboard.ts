import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DriverSidebar } from '../../shared/driver-sidebar/driver-sidebar';
import { ParcelService } from '../../services/parcel.service';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast.service';
import { Parcel } from '../../models/parcels';

@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DriverSidebar],
  templateUrl: './driver-dashboard.html',
  styleUrl: './driver-dashboard.css'
})
export class DriverDashboard implements OnInit {
  driver = { name: 'Driver One', email: 'driver@gmail.com' };
  parcels: Parcel[] = [];
  loading = false;
  error = '';

  constructor(
    private parcelService: ParcelService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadDriverParcels();
  }

  loadDriverParcels() {
    this.loading = true;
    this.error = '';
    
    // For now, we'll get all parcels. In a real app, you'd filter by driver ID
    this.parcelService.getParcels().subscribe({
      next: (parcels: Parcel[]) => {
        // Filter parcels assigned to this driver (mock for now)
        this.parcels = parcels.filter(p => p.assignedDriverId === 'driver1' || !p.assignedDriverId);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading driver parcels:', err);
        this.error = 'Failed to load parcels. Please try again.';
        this.loading = false;
        this.parcels = [];
      }
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
      },
      error: (err) => {
        console.error('Error updating parcel status:', err);
        this.toastService.error('Failed to update parcel status. Please try again.');
      }
    });
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
}
