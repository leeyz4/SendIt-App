import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserSidebar } from '../../shared/user-sidebar/user-sidebar';
import { ParcelService } from '../../services/parcel.service';
import { AuthService } from '../../services/auth';
import { Parcel } from '../../models/parcels';

interface Delivery {
  trackingNo: string;
  sender: string;
  recipient: string;
  date: string;
  status: string;
  type: 'sent' | 'received'; // Add type to distinguish sent vs received
}

@Component({
  selector: 'app-delivery-history',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule, UserSidebar],
  templateUrl: './delivery-history.html',
  styleUrls: ['./delivery-history.css']
})
export class DeliveryHistory implements OnInit {
  searchTerm = '';
  selectedDate = '';
  selectedStatus = '';
  selectedType = ''; // Add filter for sent/received
  sentDeliveries: Delivery[] = [];
  receivedDeliveries: Delivery[] = [];
  allDeliveries: Delivery[] = [];
  loading = false;
  error = '';
  currentUserId = '';

  constructor(
    private parcelService: ParcelService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.getCurrentUser();
    this.loadDeliveries();
  }

  getCurrentUser() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.currentUserId = currentUser.id;
    console.log('Current user ID:', this.currentUserId);
  }

  loadDeliveries() {
    if (!this.currentUserId) {
      this.error = 'User not authenticated. Please login again.';
      return;
    }

    this.loading = true;
    this.error = '';
    
    // Load sent parcels
    this.parcelService.getParcelsBySender(this.currentUserId).subscribe({
      next: (sentParcels: Parcel[]) => {
        this.sentDeliveries = sentParcels.map(parcel => ({
          trackingNo: parcel.trackingId,
          sender: parcel.sender?.name || 'Unknown',
          recipient: parcel.recipient?.name || 'Unknown',
          date: new Date(parcel.createdAt).toISOString().split('T')[0],
          status: parcel.status,
          type: 'sent' as const
        }));
        
        // Load received parcels
        this.parcelService.getParcelsByRecipient(this.currentUserId).subscribe({
          next: (receivedParcels: Parcel[]) => {
            this.receivedDeliveries = receivedParcels.map(parcel => ({
              trackingNo: parcel.trackingId,
              sender: parcel.sender?.name || 'Unknown',
              recipient: parcel.recipient?.name || 'Unknown',
              date: new Date(parcel.createdAt).toISOString().split('T')[0],
              status: parcel.status,
              type: 'received' as const
            }));
            
            // Combine all deliveries
            this.allDeliveries = [...this.sentDeliveries, ...this.receivedDeliveries];
            this.loading = false;
          },
          error: (err) => {
            console.error('Error loading received deliveries:', err);
            this.error = 'Failed to load received deliveries.';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error loading sent deliveries:', err);
        this.error = 'Failed to load sent deliveries.';
        this.loading = false;
      }
    });
  }

  get filteredDeliveries() {
    const term = this.searchTerm.toLowerCase();
    return this.allDeliveries.filter(d =>
      (d.trackingNo.toLowerCase().includes(term) ||
       d.sender.toLowerCase().includes(term) ||
       d.recipient.toLowerCase().includes(term)) &&
      (this.selectedDate ? d.date === this.selectedDate : true) &&
      (this.selectedStatus ? d.status.toLowerCase() === this.selectedStatus.toLowerCase() : true) &&
      (this.selectedType ? d.type === this.selectedType : true)
    );
  }

  get sentDeliveriesCount() {
    return this.sentDeliveries.length;
  }

  get receivedDeliveriesCount() {
    return this.receivedDeliveries.length;
  }

  get totalDeliveriesCount() {
    return this.allDeliveries.length;
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
