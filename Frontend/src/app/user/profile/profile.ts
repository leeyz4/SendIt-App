import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserSidebar } from '../../shared/user-sidebar/user-sidebar';
import { ParcelService } from '../../services/parcel.service';
import { Parcel } from '../../models/parcels';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, UserSidebar],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  userDeliveries: Parcel[] = [];
  userFirstName = '';
  userLastName = '';
  loading = false;

  constructor(private parcelService: ParcelService) {}

  ngOnInit() {
    this.loadUserDeliveries();
  }

  loadUserDeliveries() {
    this.loading = true;
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (currentUser.id) {
      // Get all parcels for the user (both sent and received)
      this.parcelService.getParcelsForUser(currentUser.id).subscribe({
        next: (deliveries) => {
          this.userDeliveries = deliveries;
          this.extractUserNames();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading user deliveries:', error);
          this.loading = false;
        }
      });
    }
  }

  extractUserNames() {
    // Look for the most recent delivery to get user names
    if (this.userDeliveries.length > 0) {
      const mostRecentDelivery = this.userDeliveries[0]; // Assuming sorted by date
      
      // Check if user is sender or recipient and extract names
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      if (mostRecentDelivery.sender && mostRecentDelivery.sender.id === currentUser.id) {
        // User is sender, extract sender names
        const senderName = mostRecentDelivery.sender.name;
        const nameParts = senderName.split(' ');
        this.userFirstName = nameParts[0] || '';
        this.userLastName = nameParts.slice(1).join(' ') || '';
      } else if (mostRecentDelivery.recipient && mostRecentDelivery.recipient.id === currentUser.id) {
        // User is recipient, extract recipient names
        const recipientName = mostRecentDelivery.recipient.name;
        const nameParts = recipientName.split(' ');
        this.userFirstName = nameParts[0] || '';
        this.userLastName = nameParts.slice(1).join(' ') || '';
      }
    }
  }

  getUserInitials(): string {
    const firstName = this.userFirstName || this.user.firstName || '';
    const lastName = this.userLastName || this.user.lastName || '';
    
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    
    return firstInitial + lastInitial;
  }
}
