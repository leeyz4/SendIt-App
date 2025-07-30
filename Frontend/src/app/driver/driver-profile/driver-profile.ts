import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DriverSidebar } from '../../shared/driver-sidebar/driver-sidebar';
import { DriverService } from '../../services/driver.service';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast.service';
import { Driver } from '../../models/drivers';

@Component({
  selector: 'app-driver-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, DriverSidebar],
  templateUrl: './driver-profile.html',
  styleUrl: './driver-profile.css'
})
export class DriverProfile implements OnInit {
  driver: any = {};
  loading = false;
  error = '';
  isEditing = false;
  editForm = {
    name: '',
    email: '',
    phone: ''
  };

  constructor(
    private driverService: DriverService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadDriverProfile();
  }

  loadDriverProfile() {
    this.loading = true;
    this.error = '';
    
    // Get current driver info from localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.driver = currentUser;
    
    if (!this.driver.id) {
      this.error = 'Driver information not found. Please login again.';
      return;
    }
    
    // Initialize edit form
    this.editForm = {
      name: this.driver.name || '',
      email: this.driver.email || '',
      phone: this.driver.phone || ''
    };
    
    this.loading = false;
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Reset form to original values
      this.editForm = {
        name: this.driver.name || '',
        email: this.driver.email || '',
        phone: this.driver.phone || ''
      };
    }
  }

  saveProfile() {
    // Here you would typically call an API to update the driver profile
    // For now, we'll just update the local storage
    this.driver = { ...this.driver, ...this.editForm };
    localStorage.setItem('currentUser', JSON.stringify(this.driver));
    
    this.isEditing = false;
    this.toastService.success('Profile updated successfully!');
  }

  cancelEdit() {
    this.isEditing = false;
    this.editForm = {
      name: this.driver.name || '',
      email: this.driver.email || '',
      phone: this.driver.phone || ''
    };
  }

  logout() {
    this.authService.logout();
  }
} 