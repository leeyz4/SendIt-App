import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminSidebar } from '../../shared/admin-sidebar/admin-sidebar';
import { ParcelService } from '../../services/parcel.service';
import { DriverService } from '../../services/driver.service';
import { UserService } from '../../services/user.service';
import { AlertService } from '../../services/alert.service';
import { Driver } from '../../models/drivers';

@Component({
  selector: 'app-create-delivery',
  standalone: true,
  imports: [FormsModule, CommonModule, AdminSidebar],
  templateUrl: './create-delivery.html',
  styleUrl: './create-delivery.css'
})
export class CreateDelivery implements OnInit {
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
  recipientEmail = ''; // Add recipient email field
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
  packageDescription = '';
  packagePickup = '';
  packageDestination = '';
  specialInstructions = '';
  packageOrigin = '';
  // Delivery
  deliveryOption = '';
  deliveryDate = '';
  insurance = false;
  // Driver Assignment
  availableDrivers: Driver[] = [];
  selectedDriverId = '';
  showDriverAssignment = false;
  createdParcelId = '';

  message = '';
  messageType: 'success' | 'error' | '' = '';
  loading = false;

  constructor(
    private parcelService: ParcelService,
    private driverService: DriverService,
    private userService: UserService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.loadAvailableDrivers();
  }

  loadAvailableDrivers() {
    console.log('Loading available drivers...');
    this.driverService.getDrivers().subscribe({
      next: (response: any) => {
        console.log('Drivers loaded successfully:', response);
        // Filter for active drivers only
        if (response.success && response.data) {
          this.availableDrivers = response.data.filter((driver: Driver) => driver.status === 'active');
        } else {
          this.availableDrivers = [];
        }
        console.log('Available drivers after processing:', this.availableDrivers);
      },
      error: (err) => {
        console.error('Error loading drivers:', err);
        console.error('Error details:', err.error);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        this.availableDrivers = [];
        console.log('No drivers available due to backend error');
      }
    });
  }

  createParcel() {
    // Debug: Log all field values to see what's missing
    console.log('Form validation debug:');
    console.log('Sender fields:', {
      email: this.senderEmail,
      country: this.senderCountry,
      firstName: this.senderFirstName,
      lastName: this.senderLastName,
      address: this.senderAddress,
      city: this.senderCity,
      zip: this.senderZip,
      phone: this.senderPhone
    });
    console.log('Recipient fields:', {
      email: this.recipientEmail,
      country: this.recipientCountry,
      firstName: this.recipientFirstName,
      lastName: this.recipientLastName,
      address: this.recipientAddress,
      city: this.recipientCity,
      zip: this.recipientZip,
      phone: this.recipientPhone
    });
    console.log('Package fields:', {
      type: this.packageType,
      weight: this.weight,
      deliveryDate: this.deliveryDate,
      deliveryDateType: typeof this.deliveryDate,
      deliveryDateLength: this.deliveryDate ? this.deliveryDate.length : 0
    });

    // Validate required fields - only check fields that are actually in the form
    if (!this.senderEmail || !this.senderCountry || !this.senderFirstName || !this.senderLastName || !this.senderAddress || !this.senderCity || !this.senderZip ||
        !this.recipientEmail || !this.recipientCountry || !this.recipientFirstName || !this.recipientLastName || !this.recipientAddress || !this.recipientCity || !this.recipientZip ||
        !this.packageType || !this.weight || !this.deliveryDate) {
      
      // Show which specific fields are missing
      const missingFields = [];
      if (!this.senderEmail) missingFields.push('Sender Email');
      if (!this.senderCountry) missingFields.push('Sender Country');
      if (!this.senderFirstName) missingFields.push('Sender First Name');
      if (!this.senderLastName) missingFields.push('Sender Last Name');
      if (!this.senderAddress) missingFields.push('Sender Address');
      if (!this.senderCity) missingFields.push('Sender City');
      if (!this.senderZip) missingFields.push('Sender Zip');
      if (!this.recipientEmail) missingFields.push('Recipient Email');
      if (!this.recipientCountry) missingFields.push('Recipient Country');
      if (!this.recipientFirstName) missingFields.push('Recipient First Name');
      if (!this.recipientLastName) missingFields.push('Recipient Last Name');
      if (!this.recipientAddress) missingFields.push('Recipient Address');
      if (!this.recipientCity) missingFields.push('Recipient City');
      if (!this.recipientZip) missingFields.push('Recipient Zip');
      if (!this.packageType) missingFields.push('Package Type');
      if (!this.weight) missingFields.push('Weight');
      if (!this.deliveryDate) missingFields.push('Delivery Date');
      
      this.message = `Please fill in all required fields. Missing: ${missingFields.join(', ')}`;
      this.messageType = 'error';
      return;
    }

    this.loading = true;
    this.message = '';
    this.messageType = '';

    // Generate tracking ID
    const trackingId = this.generateTrackingId();
    
    // Create or get sender user
    const senderEmail = this.senderEmail || `${this.senderFirstName.toLowerCase()}.${this.senderLastName.toLowerCase()}@sender.com`;
    const senderName = `${this.senderFirstName} ${this.senderLastName}`;
    
    // Create or get recipient user
    const recipientEmail = this.recipientEmail || `${this.recipientFirstName.toLowerCase()}.${this.recipientLastName.toLowerCase()}@recipient.com`;
    const recipientName = `${this.recipientFirstName} ${this.recipientLastName}`;
    
    // Validate names length (backend requires at least 6 characters)
    if (senderName.length < 6 || recipientName.length < 6) {
      this.message = 'Sender and recipient names must be at least 6 characters long.';
      this.messageType = 'error';
      this.loading = false;
      return;
    }
    
    // First try to find existing sender by email
    this.userService.findByEmail(senderEmail).subscribe({
      next: (senderResponse) => {
        let senderId = '';
        if (senderResponse.success && senderResponse.data) {
          senderId = senderResponse.data.id;
        } else {
          // Create new sender user
          this.createSenderUser(trackingId, senderName, senderEmail, recipientName, recipientEmail);
          return;
        }
        
        // Now find or create recipient
        this.userService.findByEmail(recipientEmail).subscribe({
          next: (recipientResponse) => {
            if (recipientResponse.success && recipientResponse.data) {
              this.createParcelWithRecipient(trackingId, senderId, recipientResponse.data.id);
            } else {
              // Create new recipient user
              this.createRecipientUser(trackingId, senderId, recipientName, recipientEmail);
            }
          },
          error: (err) => {
            console.log('Recipient search failed, creating new recipient:', err);
            // Create new recipient user when search fails
            this.createRecipientUser(trackingId, senderId, recipientName, recipientEmail);
          }
        });
      },
      error: (err) => {
        console.log('Sender search failed, creating new sender:', err);
        // Create new sender user when search fails
        this.createSenderUser(trackingId, senderName, senderEmail, recipientName, recipientEmail);
      }
    });
  }

  createSenderUser(trackingId: string, senderName: string, senderEmail: string, recipientName: string, recipientEmail: string) {
    // Format phone number to ensure it's valid for backend validation
    let formattedPhone = undefined;
    if (this.senderPhone && typeof this.senderPhone === 'string') {
      // Remove all non-digit characters and ensure it starts with +
      const cleaned = this.senderPhone.replace(/\D/g, '');
      if (cleaned.length >= 10) {
        formattedPhone = `+${cleaned}`;
      }
    }
    
    const newSender = {
      name: senderName,
      email: senderEmail,
      password: 'user123', // Changed from tempPassword123!
      confirmPassword: 'user123', // Changed from tempPassword123!
      phone: formattedPhone,
      role: 'USER' as any // Cast to any to avoid type issues
    };
    
    console.log('Creating sender with data:', newSender);
    
    this.userService.createUser(newSender).subscribe({
      next: (response) => {
        console.log('Sender creation response:', response);
        if (response.success && response.data) {
          console.log('Sender created with ID:', response.data.id);
          // Now create recipient
          this.userService.findByEmail(recipientEmail).subscribe({
            next: (recipientResponse) => {
              console.log('Recipient search response:', recipientResponse);
              if (recipientResponse.success && recipientResponse.data) {
                console.log('Recipient found with ID:', recipientResponse.data.id);
                this.createParcelWithRecipient(trackingId, response.data.id, recipientResponse.data.id);
              } else {
                // Create new recipient user
                this.createRecipientUser(trackingId, response.data.id, recipientName, recipientEmail);
              }
            },
            error: (err) => {
              console.log('Recipient search failed, creating new recipient:', err);
              this.createRecipientUser(trackingId, response.data.id, recipientName, recipientEmail);
            }
          });
        } else {
          console.error('Error creating sender:', response);
          this.message = 'Failed to create sender. Please try again.';
          this.messageType = 'error';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error creating sender:', err);
        console.error('Error details:', err.error);
        console.error('Error message:', err.message);
        this.message = `Failed to create sender: ${err.error?.message || err.message || 'Unknown error'}`;
        this.messageType = 'error';
        this.loading = false;
      }
    });
  }

  createRecipientUser(trackingId: string, senderId: string, recipientName: string, recipientEmail: string) {
    // Format phone number to ensure it's valid for backend validation
    let formattedPhone = undefined;
    if (this.recipientPhone && typeof this.recipientPhone === 'string') {
      // Remove all non-digit characters and ensure it starts with +
      const cleaned = this.recipientPhone.replace(/\D/g, '');
      if (cleaned.length >= 10) {
        formattedPhone = `+${cleaned}`;
      }
    }
    
    const newRecipient = {
      name: recipientName,
      email: recipientEmail,
      password: 'user123', // Changed from tempPassword123!
      confirmPassword: 'user123', // Changed from tempPassword123!
      phone: formattedPhone,
      role: 'USER' as any // Cast to any to avoid type issues
    };
    
    console.log('Creating recipient with data:', newRecipient);
    
    this.userService.createUser(newRecipient).subscribe({
      next: (response) => {
        console.log('Recipient creation response:', response);
        if (response.success && response.data) {
          console.log('Recipient created with ID:', response.data.id);
          this.createParcelWithRecipient(trackingId, senderId, response.data.id);
        } else {
          console.error('Error creating recipient:', response);
          this.message = 'Failed to create recipient. Please try again.';
          this.messageType = 'error';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error creating recipient:', err);
        console.error('Error details:', err.error);
        console.error('Error message:', err.message);
        this.message = `Failed to create recipient: ${err.error?.message || err.message || 'Unknown error'}`;
        this.messageType = 'error';
        this.loading = false;
      }
    });
  }

  createParcelWithRecipient(trackingId: string, senderId: string, recipientId: string) {
    console.log('Creating parcel with senderId:', senderId, 'recipientId:', recipientId);
    
    const newParcel = {
      trackingId: trackingId,
      description: this.packageDescription || `${this.packageType} - ${this.specialInstructions || 'No special instructions'}`,
      weight: parseFloat(this.weight),
      price: this.calculatePrice(),
      pickupLocation: this.packageOrigin || this.packagePickup || `${this.senderAddress}, ${this.senderCity}, ${this.senderState}`,
      destination: this.packageDestination || `${this.recipientAddress}, ${this.recipientCity}, ${this.recipientState}`,
      deliveryDate: new Date(this.deliveryDate),
      senderId: senderId,
      recipientId: recipientId,
      status: 'PENDING',
      approvalStatus: 'PENDING_APPROVAL',
      length: this.length,
      width: this.width,
      height: this.height
    };
    
    console.log('Parcel data being sent:', newParcel);

    this.parcelService.createParcel(newParcel).subscribe({
      next: (response) => {
        console.log('Parcel creation response:', response);
        console.log('Parcel sender:', response.data?.sender);
        console.log('Parcel recipient:', response.data?.recipient);
        if ((response.success && response.data) || response.id) {
          this.createdParcelId = response.data?.id || response.id;
          this.message = `Delivery created successfully! 
          
          📧 **Sender Login Instructions:**
          - Email: ${this.senderEmail}
          - Password: user123
          - The sender needs to login and approve this delivery before it can be assigned to a driver.
          
          📧 **Recipient Login Instructions:**
          - Email: ${this.recipientEmail}
          - Password: user123
          - The recipient can track this delivery once approved.`;
          this.messageType = 'success';
          this.showDriverAssignment = false; // Don't show driver assignment immediately
          this.loading = false;
        } else {
          console.error('Error creating parcel:', response);
          this.message = 'Failed to create parcel. Please try again.';
          this.messageType = 'error';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error creating parcel:', err);
        this.message = 'Failed to create parcel. Please try again.';
        this.messageType = 'error';
        this.loading = false;
      }
    });
  }

  assignDriver() {
    if (!this.selectedDriverId) {
      this.message = 'Please select a driver.';
      this.messageType = 'error';
      return;
    }

    this.loading = true;
    this.message = '';

    this.parcelService.assignDriverToParcel(this.createdParcelId, this.selectedDriverId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.message = `Parcel assigned to driver successfully! Tracking ID: ${response.data.trackingId}`;
          this.messageType = 'success';
          this.loading = false;
          this.resetForm();
        } else {
          console.error('Error assigning driver:', response);
          this.message = 'Failed to assign driver. Please try again.';
          this.messageType = 'error';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error assigning driver:', err);
        this.message = 'Failed to assign driver. Please try again.';
        this.messageType = 'error';
        this.loading = false;
      }
    });
  }

  generateTrackingId(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TRK${timestamp.slice(-6)}${random}`;
  }

  calculatePrice(): number {
    const basePrice = 20;
    const weightPrice = parseFloat(this.weight) * 2;
    const insurancePrice = this.insurance ? 10 : 0;
    return basePrice + weightPrice + insurancePrice;
  }

  resetForm() {
    // Reset all form fields
    this.senderEmail = '';
    this.senderCountry = '';
    this.senderFirstName = '';
    this.senderLastName = '';
    this.senderAddress = '';
    this.senderCity = '';
    this.senderState = '';
    this.senderZip = '';
    this.senderPhone = '';
    this.recipientCountry = '';
    this.recipientFirstName = '';
    this.recipientLastName = '';
    this.recipientEmail = ''; // Reset recipient email field
    this.recipientAddress = '';
    this.recipientCity = '';
    this.recipientState = '';
    this.recipientZip = '';
    this.recipientPhone = '';
    this.packageType = '';
    this.weight = '';
    this.length = '';
    this.width = '';
    this.height = '';
    this.packageDescription = '';
    this.packagePickup = '';
    this.packageDestination = '';
    this.specialInstructions = '';
    this.packageOrigin = '';
    this.deliveryOption = '';
    this.deliveryDate = '';
    this.insurance = false;
    this.selectedDriverId = '';
    this.showDriverAssignment = false;
    this.createdParcelId = '';
  }

  skipDriverAssignment() {
    this.message = 'Parcel created successfully! You can assign a driver later from the parcels page.';
    this.messageType = 'success';
    this.resetForm();
  }
}
