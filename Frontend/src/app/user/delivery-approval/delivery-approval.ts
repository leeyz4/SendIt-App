import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserSidebar } from '../../shared/user-sidebar/user-sidebar';
import { ParcelService } from '../../services/parcel.service';
import { AuthService } from '../../services/auth';
import { Parcel } from '../../models/parcels';

@Component({
  selector: 'app-delivery-approval',
  standalone: true,
  imports: [CommonModule, FormsModule, UserSidebar],
  templateUrl: './delivery-approval.html',
  styleUrl: './delivery-approval.css'
})
export class DeliveryApproval implements OnInit {
  pendingDeliveries: Parcel[] = [];
  loading = false;
  error = '';
  selectedDelivery: Parcel | null = null;
  rejectionReason = '';
  showRejectionModal = false;
  currentUserId = '';

  constructor(
    private parcelService: ParcelService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.getCurrentUser();
    this.loadPendingDeliveries();
  }

  getCurrentUser() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.currentUserId = currentUser.id;
    console.log('Current user ID for approvals:', this.currentUserId);
  }

  loadPendingDeliveries() {
    if (!this.currentUserId) {
      this.error = 'User not authenticated. Please login again.';
      return;
    }

    this.loading = true;
    this.error = '';
    
    // Only load pending approvals for the current user (where they are the sender)
    this.parcelService.getPendingApprovalsForUser(this.currentUserId).subscribe({
      next: (deliveries: Parcel[]) => {
        this.pendingDeliveries = deliveries;
        this.loading = false;
        console.log('Loaded pending deliveries for user:', this.currentUserId, 'Count:', deliveries.length);
      },
      error: (err) => {
        console.error('Error loading pending deliveries:', err);
        this.error = 'Failed to load pending deliveries. Please try again.';
        this.loading = false;
        this.pendingDeliveries = [];
      }
    });
  }

  approveDelivery(delivery: Parcel) {
    this.loading = true;
    this.parcelService.approveParcel(delivery.id, 'APPROVED').subscribe({
      next: (updatedDelivery) => {
        this.loading = false;
        this.loadPendingDeliveries(); // Reload the list
        alert('Delivery approved successfully!');
      },
      error: (err) => {
        console.error('Error approving delivery:', err);
        this.error = 'Failed to approve delivery. Please try again.';
        this.loading = false;
      }
    });
  }

  rejectDelivery(delivery: Parcel) {
    this.selectedDelivery = delivery;
    this.showRejectionModal = true;
  }

  confirmRejection() {
    if (!this.selectedDelivery || !this.rejectionReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }

    this.loading = true;
    this.parcelService.approveParcel(this.selectedDelivery.id, 'REJECTED', this.rejectionReason).subscribe({
      next: (updatedDelivery) => {
        this.loading = false;
        this.showRejectionModal = false;
        this.selectedDelivery = null;
        this.rejectionReason = '';
        this.loadPendingDeliveries(); // Reload the list
        alert('Delivery rejected successfully!');
      },
      error: (err) => {
        console.error('Error rejecting delivery:', err);
        this.error = 'Failed to reject delivery. Please try again.';
        this.loading = false;
      }
    });
  }

  cancelRejection() {
    this.showRejectionModal = false;
    this.selectedDelivery = null;
    this.rejectionReason = '';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PENDING_APPROVAL':
        return 'badge-pending';
      case 'APPROVED':
        return 'badge-approved';
      case 'REJECTED':
        return 'badge-rejected';
      default:
        return 'badge-default';
    }
  }

  // Helper method to get current user email for password reset
  getCurrentUserEmail(): string {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return currentUser.email || '';
  }

  // Method to help users reset their password
  resetPassword() {
    const email = this.getCurrentUserEmail();
    if (email) {
      // Navigate to forgot password page with email pre-filled
      window.open(`/forgot-password?email=${email}`, '_blank');
    } else {
      alert('Please login first to reset your password.');
    }
  }
} 