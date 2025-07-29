import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebar } from '../../shared/admin-sidebar/admin-sidebar';
import { ParcelService } from '../../services/parcel.service';
import { Parcel } from '../../models/parcels';

@Component({
  selector: 'app-rejected-deliveries',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebar],
  templateUrl: './rejected-deliveries.html',
  styleUrl: './rejected-deliveries.css'
})
export class RejectedDeliveries implements OnInit {
  rejectedDeliveries: Parcel[] = [];
  loading = false;
  error = '';
  selectedDelivery: Parcel | null = null;
  showEditModal = false;
  editedDelivery: any = {};

  constructor(private parcelService: ParcelService) {}

  ngOnInit() {
    this.loadRejectedDeliveries();
  }

  loadRejectedDeliveries() {
    this.loading = true;
    this.error = '';
    
    this.parcelService.getRejectedParcels().subscribe({
      next: (deliveries: Parcel[]) => {
        this.rejectedDeliveries = deliveries;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading rejected deliveries:', err);
        this.error = 'Failed to load rejected deliveries. Please try again.';
        this.loading = false;
        this.rejectedDeliveries = [];
      }
    });
  }

  editDelivery(delivery: Parcel) {
    this.selectedDelivery = delivery;
    this.editedDelivery = {
      description: delivery.description,
      weight: delivery.weight,
      price: delivery.price,
      pickupLocation: delivery.pickupLocation,
      destination: delivery.destination,
      deliveryDate: delivery.deliveryDate ? new Date(delivery.deliveryDate).toISOString().split('T')[0] : ''
    };
    this.showEditModal = true;
  }

  resubmitDelivery() {
    if (!this.selectedDelivery) {
      alert('No delivery selected.');
      return;
    }

    // Format the data properly for the backend
    const resubmitData = {
      description: this.editedDelivery.description,
      weight: parseFloat(this.editedDelivery.weight),
      price: parseFloat(this.editedDelivery.price),
      pickupLocation: this.editedDelivery.pickupLocation,
      destination: this.editedDelivery.destination,
      deliveryDate: this.editedDelivery.deliveryDate ? new Date(this.editedDelivery.deliveryDate) : null
    };

    this.loading = true;
    this.parcelService.resubmitParcel(this.selectedDelivery.id, resubmitData).subscribe({
      next: (response) => {
        this.loading = false;
        this.showEditModal = false;
        this.selectedDelivery = null;
        this.editedDelivery = {};
        this.loadRejectedDeliveries(); // Reload the list
        alert('Delivery resubmitted successfully! User will review the updated details.');
      },
      error: (err) => {
        console.error('Error resubmitting delivery:', err);
        this.error = 'Failed to resubmit delivery. Please try again.';
        this.loading = false;
      }
    });
  }

  cancelEdit() {
    this.showEditModal = false;
    this.selectedDelivery = null;
    this.editedDelivery = {};
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'badge-pending';
      case 'PICKED_UP':
        return 'badge-picked';
      case 'IN_TRANSIT':
        return 'badge-transit';
      case 'DELIVERED':
        return 'badge-delivered';
      case 'CANCELLED':
        return 'badge-cancelled';
      default:
        return 'badge-default';
    }
  }

  getApprovalStatusBadgeClass(status: string): string {
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
} 