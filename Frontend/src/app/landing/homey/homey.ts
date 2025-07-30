import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ParcelService } from '../../services/parcel.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-homey',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './homey.html',
  styleUrl: './homey.css'
})
export class Homey {
  trackingNumber = '';

  constructor(private router: Router, private parcelService: ParcelService, private toastService: ToastService) {}

  ngOnInit() {
    // Component initialization logic
  }

  trackParcel() {
    if (!this.trackingNumber.trim()) {
      this.toastService.error('Please enter a tracking number');
      return;
    }

    // Store tracking number and navigate to tracking page
    localStorage.setItem('pendingTrackingNumber', this.trackingNumber);
    this.router.navigate(['/parcel-tracking']);
  }
} 