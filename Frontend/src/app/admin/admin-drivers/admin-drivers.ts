import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-drivers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-drivers.html',
  styleUrl: './admin-drivers.css'
})
export class AdminDrivers {
  drivers = (JSON.parse(localStorage.getItem('users') || '[]') as any[])
    .filter(u => u.role === 'driver' || (u.email && u.email.includes('driver')));
  parcels = JSON.parse(localStorage.getItem('parcels') || '[]');
  allUsers = JSON.parse(localStorage.getItem('users') || '[]');
  selectedDriverEmail: { [key: string]: string } = {};

  getDriverParcels(email: string) {
    return this.parcels.filter((p: any) => p.assignedDriverEmail === email);
  }

  get unassignedParcels() {
    return this.parcels.filter((p: any) => !p.assignedDriverEmail);
  }

  assignParcel(parcel: any, driverEmail: string) {
    parcel.assignedDriverEmail = driverEmail;
    localStorage.setItem('parcels', JSON.stringify(this.parcels));
  }

  toggleDriverStatus(driver: any) {
    driver.status = driver.status === 'Deactivated' ? 'Active' : 'Deactivated';
    const idx = this.allUsers.findIndex((u: any) => u.email === driver.email);
    if (idx !== -1) {
      this.allUsers[idx].status = driver.status;
      localStorage.setItem('users', JSON.stringify(this.allUsers));
    }
  }
}
