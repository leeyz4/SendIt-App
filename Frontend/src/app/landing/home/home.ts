import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ParcelService } from '../../services/parcel.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  trackingNumber = '';

  constructor(private parcelService: ParcelService, private toastService: ToastService, private router: Router) {}

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
