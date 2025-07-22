import { Component } from '@angular/core';
import { DriverNavbar } from '../../shared/driver-navbar/driver-navbar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [DriverNavbar, CommonModule],
  templateUrl: './driver-dashboard.html',
  styleUrl: './driver-dashboard.css'
})
export class DriverDashboard {
  driver = JSON.parse(localStorage.getItem('currentUser') || '{}');
  parcels = (JSON.parse(localStorage.getItem('parcels') || '[]') as any[]).filter(p => p.assignedDriverEmail === this.driver.email);
}
