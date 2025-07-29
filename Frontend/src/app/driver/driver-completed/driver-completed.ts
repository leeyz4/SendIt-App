import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DriverSidebar } from '../../shared/driver-sidebar/driver-sidebar';
import { ParcelService } from '../../services/parcel.service';
import { AuthService } from '../../services/auth';
import { DeliveryStatusService } from '../../services/delivery-status.service';
import { Subscription } from 'rxjs';
import { Parcel } from '../../models/parcels';

@Component({
  selector: 'app-driver-completed',
  standalone: true,
  imports: [CommonModule, FormsModule, DriverSidebar],
  templateUrl: './driver-completed.html',
  styleUrl: './driver-completed.css'
})
export class DriverCompleted implements OnInit, OnDestroy {
  completedParcels: Parcel[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  selectedDate = '';
  driverId = '';
  private subscription: Subscription = new Subscription();

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
    
    this.loadCompletedDeliveries();
    
    // Subscribe to delivery completion notifications
    this.subscription.add(
      this.deliveryStatusService.deliveryCompleted$.subscribe(parcelId => {
        if (parcelId && parcelId !== 'refresh') {
          console.log('📦 Received delivery completion notification for parcel:', parcelId);
          // Reload completed deliveries when a new delivery is completed
          setTimeout(() => {
            this.loadCompletedDeliveries();
          }, 500);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadCompletedDeliveries() {
    this.loading = true;
    this.error = '';
    
    this.parcelService.getParcels().subscribe({
      next: (parcels) => {
        // Filter completed parcels assigned to this driver
        this.completedParcels = parcels.filter(p => 
          p.assignedDriverId === this.driverId && p.status === 'DELIVERED'
        );
        console.log('📦 Loaded completed deliveries for driver:', this.driverId, 'Count:', this.completedParcels.length);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading completed deliveries:', err);
        this.error = 'Failed to load completed deliveries. Please try again.';
        this.loading = false;
        this.completedParcels = [];
      }
    });
  }

  get filteredCompletedParcels() {
    return this.completedParcels.filter(p => {
      const matchesSearch = !this.searchTerm || 
        p.trackingId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.pickupLocation.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        p.destination.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesDate = !this.selectedDate || 
        p.deliveryDate && new Date(p.deliveryDate).toISOString().split('T')[0] === this.selectedDate;
      
      return matchesSearch && matchesDate;
    });
  }

  getTotalCompleted(): number {
    return this.completedParcels.length;
  }

  getTotalEarnings(): number {
    return this.completedParcels.reduce((total, parcel) => total + (parcel.price || 0), 0);
  }

  getAverageDeliveryTime(): string {
    if (this.completedParcels.length === 0) return '0 days';
    
    const totalDays = this.completedParcels.reduce((total, parcel) => {
      const created = new Date(parcel.createdAt);
      const delivered = new Date(parcel.deliveryDate || parcel.updatedAt);
      const diffTime = Math.abs(delivered.getTime() - created.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return total + diffDays;
    }, 0);
    
    const averageDays = Math.round(totalDays / this.completedParcels.length);
    return `${averageDays} days`;
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

  formatDate(dateInput: string | Date): string {
    if (!dateInput) return 'N/A';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString();
  }

  formatDeliveryDate(parcel: any): string {
    const deliveryDate = parcel.deliveryDate ? new Date(parcel.deliveryDate) : null;
    const updatedAt = parcel.updatedAt ? new Date(parcel.updatedAt) : null;
    const dateToUse = deliveryDate || updatedAt;
    return dateToUse ? dateToUse.toLocaleDateString() : 'N/A';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount);
  }
} 