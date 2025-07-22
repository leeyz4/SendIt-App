import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-delivery',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './create-delivery.html',
  styleUrl: './create-delivery.css'
})
export class CreateDelivery {
  // Sender
  senderEmail = '';
  senderCountry = '';
  senderFirstName = '';
  senderLastName = '';
  senderAddress = '';
  senderCity = '';
  senderState = '';
  senderZip = '';
  senderPhone = '';
  // Recipient
  recipientCountry = '';
  recipientFirstName = '';
  recipientLastName = '';
  recipientAddress = '';
  recipientCity = '';
  recipientState = '';
  recipientZip = '';
  recipientPhone = '';
  // Package
  packageType = '';
  weight = '';
  length = '';
  width = '';
  height = '';
  specialInstructions = '';
  // Delivery
  deliveryOption = '';
  deliveryDate = '';
  insurance = false;

  message = '';
  messageType: 'success' | 'error' | '' = '';

  createParcel() {
    // Validate required fields
    if (!this.senderEmail || !this.senderCountry || !this.senderFirstName || !this.senderLastName || !this.senderAddress || !this.senderCity || !this.senderState || !this.senderZip || !this.senderPhone ||
        !this.recipientCountry || !this.recipientFirstName || !this.recipientLastName || !this.recipientAddress || !this.recipientCity || !this.recipientState || !this.recipientZip || !this.recipientPhone ||
        !this.packageType || !this.weight || !this.length || !this.width || !this.height || !this.deliveryDate) {
      this.message = 'Please fill in all required fields.';
      this.messageType = 'error';
      return;
    }
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const newParcel = {
      trackingId: 'TRK' + Date.now(),
      sender: currentUser.firstName + ' ' + currentUser.lastName,
      senderEmail: this.senderEmail,
      recipient: this.recipientFirstName + ' ' + this.recipientLastName,
      recipientPhone: this.recipientPhone,
      packageType: this.packageType,
      weight: this.weight,
      dimensions: `${this.length}x${this.width}x${this.height}`,
      specialInstructions: this.specialInstructions,
      deliveryOption: this.deliveryOption,
      deliveryDate: this.deliveryDate,
      insurance: this.insurance,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    let parcels = JSON.parse(localStorage.getItem('parcels') || '[]');
    parcels.push(newParcel);
    localStorage.setItem('parcels', JSON.stringify(parcels));
    this.message = 'Parcel created successfully!';
    this.messageType = 'success';
    // Optionally, reset form fields here
  }
}
