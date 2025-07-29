import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { UserSidebar } from '../../shared/user-sidebar/user-sidebar';
import { ParcelService } from '../../services/parcel.service';
import { Parcel } from '../../models/parcels';

@Component({
  selector: 'app-parcel-details',
  standalone: true,
  imports: [CommonModule, RouterModule, UserSidebar],
  templateUrl: './parcel-details.html',
  styleUrl: './parcel-details.css'
})
export class ParcelDetails implements OnInit {
  trackingId: string = '';
  parcel: Parcel | null = null;
  loading = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private parcelService: ParcelService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.trackingId = params['trackingId'];
      if (this.trackingId) {
        this.loadParcelDetails();
      }
    });
  }

  loadParcelDetails() {
    this.loading = true;
    this.error = '';

    this.parcelService.getParcelByTrackingId(this.trackingId).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.parcel = response.data;
        } else {
          this.error = 'Parcel not found';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading parcel details:', err);
        this.error = 'Failed to load parcel details';
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'DELIVERED': return 'status-delivered';
      case 'IN_TRANSIT': return 'status-transit';
      case 'PENDING': return 'status-pending';
      case 'CANCELLED': return 'status-cancelled';
      case 'PICKED_UP': return 'status-picked';
      default: return 'status-pending';
    }
  }

  getStatusDisplayName(status: string): string {
    switch (status) {
      case 'DELIVERED': return 'Delivered';
      case 'IN_TRANSIT': return 'In Transit';
      case 'PENDING': return 'Pending';
      case 'CANCELLED': return 'Cancelled';
      case 'PICKED_UP': return 'Picked Up';
      default: return 'Pending';
    }
  }

  getDimensions(): string {
    if (!this.parcel) return 'N/A';
    
    const length = this.parcel.length || 'N/A';
    const width = this.parcel.width || 'N/A';
    const height = this.parcel.height || 'N/A';
    
    return `${length}cm * ${width}cm * ${height}cm`;
  }
}
