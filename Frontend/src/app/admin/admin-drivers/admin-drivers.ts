import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DriverService } from '../../services/driver.service';
import { ParcelService } from '../../services/parcel.service';
import { ToastService } from '../../services/toast.service';
import { Driver } from '../../models/drivers';
import { Parcel } from '../../models/parcels';
import { AdminSidebar } from '../../shared/admin-sidebar/admin-sidebar';

@Component({
  selector: 'app-admin-drivers',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebar],
  templateUrl: './admin-drivers.html',
  styleUrl: './admin-drivers.css'
})
export class AdminDrivers implements OnInit {
  drivers: Driver[] = [];
  parcels: Parcel[] = [];
  // selectedDriverId: { [key: string]: string } = {}; // Commented out - no longer needed
  loading = false;
  error = '';

  // Create Driver properties
  showCreateDriverForm = false;
  creatingDriver = false;
  createDriverMessage = '';
  createDriverMessageType: 'success' | 'error' | '' = '';
  newDriver = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  };

  constructor(
    private driverService: DriverService, 
    private parcelService: ParcelService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.error = '';
    
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

    // Load parcels
    this.parcelService.getParcels().subscribe({
      next: (parcels) => {
        this.parcels = parcels;
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading parcels:', err);
        this.error = 'Failed to load data. Please try again.';
        this.loading = false;
        this.parcels = [];
      }
    });
  }

  getDriverParcels(driverId: string) {
    const driverParcels = this.parcels.filter((p: Parcel) => p.assignedDriverId === driverId);
    return driverParcels;
  }

  // Commented out - using approved-deliveries for driver assignment instead
  // get unassignedParcels() {
  //   return this.parcels.filter((p: Parcel) => !p.assignedDriverId);
  // }

  toggleDriverStatus(driver: Driver) {
    const newStatus = driver.status === 'active' ? 'inactive' : 'active';
    this.driverService.updateDriverStatus(driver.id, newStatus).subscribe({
      next: (updatedDriver) => {
        const index = this.drivers.findIndex(d => d.id === driver.id);
        if (index !== -1) {
          this.drivers[index] = updatedDriver;
        }
        this.toastService.success('Driver status updated successfully');
      },
      error: (err) => {
        console.error('Error updating driver status:', err);
        this.toastService.error('Failed to update driver status. Please try again.');
      }
    });
  }

  // Commented out - using approved-deliveries for driver assignment instead
  // assignParcel(parcel: Parcel, driverId: string) {
  //   if (!driverId) {
  //     alert('Please select a driver');
  //     return;
  //   }

  //   // Check if the selected driver is active
  //   const selectedDriver = this.drivers.find(d => d.id === driverId);
  //   if (!selectedDriver || selectedDriver.status !== 'active') {
  //     alert('Cannot assign parcel to inactive driver. Please select an active driver.');
  //     return;
  //   }

  //   console.log('Assigning parcel:', parcel.id, 'to driver:', driverId);
  //   console.log('Selected driver:', selectedDriver);

  //   this.parcelService.assignDriverToParcel(parcel.id, driverId).subscribe({
  //     next: (updatedParcel) => {
  //       // Update the parcel in the local array
  //       const index = this.parcels.findIndex(p => p.id === parcel.id);
  //       //     this.parcels[index] = updatedParcel;
  //     }
  //     console.log('Parcel assigned successfully');
  //     alert('Parcel assigned successfully!');
  //   },
  //   error: (err) => {
  //     console.error('Error assigning parcel:', err);
  //     console.error('Error details:', err.error);
  //     console.error('Error status:', err.status);
  //     alert('Failed to assign parcel. Please try again.');
  //   }
  // });
  // }

  unassignParcel(parcel: Parcel) {
    if (!parcel.assignedDriverId) {
      this.toastService.error('This parcel is not assigned to any driver.');
      return;
    }

    if (confirm(`Are you sure you want to unassign parcel ${parcel.trackingId} from the driver?`)) {
      console.log('Unassigning parcel:', parcel.id, 'from driver:', parcel.assignedDriverId);

      this.parcelService.assignDriverToParcel(parcel.id, null).subscribe({
        next: (updatedParcel) => {
          // Update the parcel in the local array
          const index = this.parcels.findIndex(p => p.id === parcel.id);
          if (index !== -1) {
            this.parcels[index] = updatedParcel;
          }
          this.toastService.success('Parcel unassigned successfully!');
        },
        error: (err) => {
          console.error('Error unassigning parcel:', err);
          console.error('Error details:', err.error);
          console.error('Error status:', err.status);
          this.toastService.error('Failed to unassign parcel. Please try again.');
        }
      });
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

  deleteDriver(driver: Driver) {
    if (confirm(`Are you sure you want to delete driver ${driver.name}? This action cannot be undone.`)) {
      console.log('🗑️ Deleting driver:', driver.id);
      this.driverService.deleteDriver(driver.id).subscribe({
        next: (response) => {
          console.log('✅ Driver deleted successfully:', response);
          // Remove the driver from the local array
          this.drivers = this.drivers.filter(d => d.id !== driver.id);
          this.toastService.success(`Driver ${driver.name} has been deleted successfully.`);
        },
        error: (err) => {
          console.error('❌ Error deleting driver:', err);
          const errorMessage = err.error?.message || err.message || 'Failed to delete driver. Please try again.';
          this.toastService.error(`Failed to delete driver: ${errorMessage}`);
        }
      });
    }
  }

  createDriver() {
    // Validate form
    if (!this.newDriver.name || !this.newDriver.email || !this.newDriver.password || !this.newDriver.confirmPassword) {
      this.createDriverMessage = 'Please fill in all required fields.';
      this.createDriverMessageType = 'error';
      return;
    }

    if (this.newDriver.password !== this.newDriver.confirmPassword) {
      this.createDriverMessage = 'Passwords do not match.';
      this.createDriverMessageType = 'error';
      return;
    }

    if (this.newDriver.password.length < 6) {
      this.createDriverMessage = 'Password must be at least 6 characters long.';
      this.createDriverMessageType = 'error';
      return;
    }

    this.creatingDriver = true;
    this.createDriverMessage = '';
    this.createDriverMessageType = '';

    // Prepare driver data
    const driverData = {
      name: this.newDriver.name,
      email: this.newDriver.email,
      phone: this.newDriver.phone || undefined,
      password: this.newDriver.password,
      confirmPassword: this.newDriver.confirmPassword,
      status: 'active'
    };

    this.driverService.createDriver(driverData).subscribe({
      next: (response: any) => {
        console.log('Driver created successfully:', response);
        this.createDriverMessage = 'Driver created successfully! They can now login with their email and password.';
        this.createDriverMessageType = 'success';
        this.creatingDriver = false;
        
        // Reset form
        this.newDriver = {
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        };
        
        // Reload drivers list
        this.loadData();
        
        // Hide form after 3 seconds
        setTimeout(() => {
          this.showCreateDriverForm = false;
          this.createDriverMessage = '';
          this.createDriverMessageType = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Error creating driver:', err);
        this.createDriverMessage = err.error?.message || 'Failed to create driver. Please try again.';
        this.createDriverMessageType = 'error';
        this.creatingDriver = false;
      }
    });
  }
}
