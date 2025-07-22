import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// import { ChartsModule } from 'ng2-charts';

interface Parcel {
  trackingId: string;
  sender: string;
  recipient: string;
  status: string;
  deliveryDate: string;
}

@Component({
  selector: 'app-admin-parcels',
  standalone: true,
  imports: [FormsModule, CommonModule /*, ChartsModule*/],
  templateUrl: './admin-parcels.html',
  styleUrl: './admin-parcels.css'
})
export class AdminParcels {
  searchTerm = '';
  selectedStatus = '';
  parcels: Parcel[] = [
    { trackingId: 'SND-OO1-A1B2', sender: 'Letsy Lizz', recipient: 'Cele Murts', status: 'In Transit', deliveryDate: '2024-03-15' },
    { trackingId: 'SND-OO1-A1B2', sender: 'Letsy Lizz', recipient: 'Cele Murts', status: 'Delivered', deliveryDate: '2024-03-15' },
    { trackingId: 'SND-OO1-A1B2', sender: 'Letsy Lizz', recipient: 'Cele Murts', status: 'Pending', deliveryDate: '2024-03-15' },
    { trackingId: 'SND-OO1-A1B2', sender: 'Letsy Lizz', recipient: 'Cele Murts', status: 'Issue', deliveryDate: '2024-03-15' }
  ];

  get filteredParcels() {
    const term = this.searchTerm.toLowerCase();
    return this.parcels.filter(p =>
      (p.trackingId.toLowerCase().includes(term) ||
       p.sender.toLowerCase().includes(term) ||
       p.recipient.toLowerCase().includes(term)) &&
      (this.selectedStatus && this.selectedStatus !== 'All' ? p.status === this.selectedStatus : true)
    );
  }

  // public lineChartData = [
  //   { data: [10, 20, 15, 30, 25, 40], label: 'Deliveries' }
  // ];
  // public lineChartLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  // public lineChartOptions = {
  //   responsive: true
  // };
}
