import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Delivery {
  trackingNo: string;
  sender: string;
  recipient: string;
  date: string;
  status: string;
}

@Component({
  selector: 'app-delivery-history',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './delivery-history.html',
  styleUrls: ['./delivery-history.css']
})
export class DeliveryHistory {
  searchTerm = '';
  selectedDate = '';
  selectedStatus = '';
  deliveries: Delivery[] = [
    { trackingNo: 'TRK9876', sender: 'Letsy Lizz', recipient: 'Cele Murts', date: '2024-07-03', status: 'Delivered' },
    { trackingNo: 'TRK9877', sender: 'Letsy Lizz', recipient: 'Cele Murts', date: '2024-07-03', status: 'Pending' },
    { trackingNo: 'TRK9878', sender: 'Letsy Lizz', recipient: 'Cele Murts', date: '2024-07-03', status: 'In Transit' },
    { trackingNo: 'TRK9879', sender: 'Letsy Lizz', recipient: 'Cele Murts', date: '2024-07-03', status: 'Cancelled' }
  ];

  get filteredDeliveries() {
    const term = this.searchTerm.toLowerCase();
    return this.deliveries.filter(d =>
      (d.trackingNo.toLowerCase().includes(term) ||
       d.recipient.toLowerCase().includes(term)) &&
      (this.selectedDate ? d.date === this.selectedDate : true) &&
      (this.selectedStatus ? d.status === this.selectedStatus : true)
    );
  }
}
