import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminSidebar } from '../../shared/admin-sidebar/admin-sidebar';
import { ParcelService } from '../../services/parcel.service';
import { DriverService } from '../../services/driver.service';
import { Parcel } from '../../models/parcels';
import { Driver } from '../../models/drivers';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminSidebar],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  // Statistics
  totalParcels = 0;
  activeUsers = 0;
  completedDeliveries = 0;
  pendingDeliveries = 0;
  
  // Data arrays
  parcels: Parcel[] = [];
  drivers: Driver[] = [];
  
  // Loading states
  loading = false;
  error = '';

  constructor(
    private parcelService: ParcelService,
    private driverService: DriverService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    this.error = '';

    // Load parcels
    this.parcelService.getParcels().subscribe({
      next: (parcels) => {
        this.parcels = parcels;
        this.loading = false;
        this.calculateStatistics();
      },
      error: (err) => {
        console.error('Error loading parcels:', err);
        this.error = 'Failed to load dashboard data.';
        this.loading = false;
      }
    });

    // Load drivers
    this.driverService.getDrivers().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.drivers = response.data;
        } else {
          this.drivers = [];
        }
      },
      error: (err) => {
        console.error('Error loading drivers:', err);
        this.drivers = [];
      }
    });
  }

  calculateStatistics() {
    // Total parcels
    this.totalParcels = this.parcels.length;
    
    // Active users (drivers + estimated users)
    this.activeUsers = this.drivers.length + Math.floor(this.parcels.length * 0.8);
    
    // Completed deliveries
    this.completedDeliveries = this.parcels.filter(p => p.status === 'DELIVERED').length;
    
    // Pending deliveries
    this.pendingDeliveries = this.parcels.filter(p => p.status === 'PENDING').length;
  }

  getPercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  getTimeAgo(dateInput: string | Date): string {
    const now = new Date();
    const date = new Date(dateInput);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
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
}
