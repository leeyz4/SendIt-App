import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserSidebar } from '../../shared/user-sidebar/user-sidebar';

@Component({
  selector: 'app-delivery-details',
  standalone: true,
  imports: [CommonModule, RouterModule, UserSidebar],
  templateUrl: './delivery-details.html',
  styleUrl: './delivery-details.css'
})
export class DeliveryDetails {

}
