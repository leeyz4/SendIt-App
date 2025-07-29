import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DriverSidebar } from '../../shared/driver-sidebar/driver-sidebar';
import { ParcelService } from '../../services/parcel.service';
import { AuthService } from '../../services/auth';
import { LocationService, DriverLocation } from '../../services/location.service';
import { SafePipe } from '../../shared/safe.pipe';
import { Parcel } from '../../models/parcels';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-driver-location',
  standalone: true,
  imports: [CommonModule, FormsModule, DriverSidebar, SafePipe],
  templateUrl: './driver-location.html',
  styleUrls: ['./driver-location.css']
})
export class DriverLocationComponent implements OnInit, OnDestroy {
  currentLocation: DriverLocation | null = null;
  assignedParcels: Parcel[] = [];
  isTracking = false;
  loading = false;
  error = '';
  driverId = '';
  private _mapUrl = 'https://maps.google.com/maps?q=-1.286389,36.817223&z=13&output=embed'; // Default to Nairobi
  showMap = false; // Control map visibility
  
  // Manual location input
  manualLatitude = '';
  manualLongitude = '';
  manualLocationName = '';
  
  private locationSubscription: Subscription | undefined;
  private trackingInterval: Subscription | undefined;

  constructor(
    private parcelService: ParcelService,
    private authService: AuthService,
    private locationService: LocationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  // Getter for map URL to avoid change detection issues
  get mapUrl(): string {
    return this._mapUrl;
  }

  // Setter for map URL with proper change detection
  set mapUrl(value: string) {
    this._mapUrl = value;
    // Use NgZone to defer the change detection
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.ngZone.run(() => {
          this.cdr.markForCheck();
        });
      }, 0);
    });
  }

  ngOnInit() {
    console.log('🚀 DriverLocationComponent ngOnInit started');
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.driverId = currentUser.id;
    console.log('👤 Driver ID from localStorage:', this.driverId);
    if (!this.driverId) {
      this.error = 'Driver ID not found. Please login again.';
      console.log('❌ No driver ID found, setting error');
      return;
    }
    console.log('✅ Driver ID found, loading assigned parcels');
    this.loadAssignedParcels();
    
    // Show map immediately with default location
    this.showMap = true;
  }

  ngOnDestroy() {
    this.stopTracking();
  }

  loadAssignedParcels() {
    console.log('🔄 Starting to load assigned parcels...');
    this.loading = true;
    this.cdr.detectChanges(); // Trigger change detection
    
    this.parcelService.getParcels().subscribe({
      next: (parcels) => {
        // Filter parcels assigned to this driver
        this.assignedParcels = parcels.filter(p => p.assignedDriverId === this.driverId);
        console.log('📦 Loaded assigned parcels for driver:', this.driverId, 'Count:', this.assignedParcels.length);
        console.log('📦 Loading state before setting to false:', this.loading);
        this.loading = false;
        console.log('📦 Loading state after setting to false:', this.loading);
        this.cdr.detectChanges(); // Trigger change detection after loading
        console.log('📦 Change detection triggered');
      },
      error: (err) => {
        console.error('Error loading assigned parcels:', err);
        this.error = 'Failed to load assigned parcels.';
        this.loading = false;
        this.cdr.detectChanges(); // Trigger change detection on error
      }
    });
  }

  startTracking() {
    if (this.isTracking) return;

    this.isTracking = true;
    this.showMap = true; // Show the map
    this.error = '';

    // Get initial location
    this.locationService.getCurrentLocation().then(position => {
      const initialLocation: DriverLocation = {
        driverId: this.driverId,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date().toISOString()
      };

      this.currentLocation = initialLocation;
      // Don't update map URL here - let the user manually update it
      console.log('📍 Initial location set:', initialLocation);
      
      // Update location to backend
      this.locationService.updateDriverLocation(this.driverId, initialLocation.latitude, initialLocation.longitude).subscribe({
        next: () => console.log('📍 Initial location saved to backend'),
        error: (err) => console.error('Error saving initial location:', err)
      });
      
      // Start periodic location updates (every 30 seconds)
      this.trackingInterval = interval(30000).subscribe(() => {
        this.updateLocation();
      });
      
    }).catch(error => {
      console.error('Error starting tracking:', error);
      this.error = 'Unable to get your location. Please check your location permissions.';
      this.isTracking = false;
      this.showMap = false;
    });
  }

  stopTracking() {
    this.isTracking = false;
    if (this.trackingInterval) {
      this.trackingInterval.unsubscribe();
      this.trackingInterval = undefined;
    }
    console.log('🛑 Location tracking stopped');
  }

  updateLocation() {
    if (!this.isTracking) return;

    this.locationService.getCurrentLocation().then(position => {
      const location: DriverLocation = {
        driverId: this.driverId,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date().toISOString()
      };

      this.currentLocation = location;
      // Don't update map URL automatically to avoid change detection issues
      console.log('📍 Location updated:', location);
      
      // Update location to backend
      this.locationService.updateDriverLocation(this.driverId, location.latitude, location.longitude).subscribe({
        next: () => console.log('📍 Location saved to backend'),
        error: (err) => {
          console.error('Error saving location:', err);
          this.error = 'Failed to save location to server.';
        }
      });
      
    }).catch(error => {
      console.error('Error updating location:', error);
      this.error = 'Failed to get current location.';
    });
  }

  updateMapLocation() {
    if (this.currentLocation) {
      // Use NgZone to defer the map URL update
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.ngZone.run(() => {
            this._mapUrl = `https://maps.google.com/maps?q=${this.currentLocation!.latitude},${this.currentLocation!.longitude}&z=15&output=embed`;
            this.cdr.markForCheck();
            console.log('🗺️ Map location updated to current position');
          });
        }, 0);
      });
    } else {
      console.log('⚠️ No current location available to update map');
    }
  }

  updateLocationForParcel(parcel: Parcel, locationName?: string) {
    if (!this.currentLocation) {
      this.error = 'Please start tracking your location first.';
      return;
    }

    this.locationService.updateParcelLocation(
      parcel.id,
      this.driverId,
      this.currentLocation.latitude,
      this.currentLocation.longitude,
      locationName
    ).subscribe({
      next: (response) => {
        console.log('📍 Location updated for parcel:', parcel.trackingId, response);
        alert(`Location updated for parcel ${parcel.trackingId}${locationName ? ` at ${locationName}` : ''}`);
      },
      error: (err) => {
        console.error('Error updating location for parcel:', err);
        this.error = 'Failed to update location for parcel.';
      }
    });
  }

  updateLocationWithName(locationName: string) {
    if (!this.currentLocation) {
      this.error = 'Please start tracking your location first.';
      return;
    }

    // Update location for all assigned parcels
    this.assignedParcels.forEach(parcel => {
      this.updateLocationForParcel(parcel, locationName);
    });
  }

  // Update location using place name (geocoding)
  updateLocationWithPlaceName(placeName: string) {
    if (!this.driverId) {
      this.error = 'Driver ID not found.';
      return;
    }

    this.loading = true;
    this.error = '';

    // Use Google Geocoding API to convert place name to coordinates
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(placeName + ', Kenya')}&key=YOUR_GOOGLE_API_KEY`;
    
    // For now, use a simple mapping of common Kenyan cities
    const cityCoordinates: { [key: string]: { lat: number, lng: number } } = {
      'nairobi': { lat: -1.286389, lng: 36.817223 },
      'embu': { lat: -0.5373, lng: 37.4574 },
      'chuka': { lat: -0.3333, lng: 37.6500 },
      'kisumu': { lat: -0.1022, lng: 34.7617 },
      'nakuru': { lat: -0.3031, lng: 36.0800 },
      'mombasa': { lat: -4.0435, lng: 39.6682 },
      'thika': { lat: -1.0333, lng: 37.0833 },
      'eldoret': { lat: 0.5204, lng: 35.2699 },
      'kakamega': { lat: 0.2842, lng: 34.7523 },
      'kericho': { lat: -0.3675, lng: 35.2836 },
      'nyeri': { lat: -0.4201, lng: 36.9476 },
      'kisii': { lat: -0.6773, lng: 34.7796 },
      'kerugoya': { lat: -0.5000, lng: 37.2833 },
      'muranga': { lat: -0.7167, lng: 37.1500 },
      'naro moru': { lat: -0.1667, lng: 37.0167 },
      'karatina': { lat: -0.4833, lng: 37.1333 },
      'sagana': { lat: -0.6667, lng: 37.2000 },
      'kutus': { lat: -0.5167, lng: 37.2667 },
      'kangema': { lat: -0.6833, lng: 36.9667 },
      'kabati': { lat: -0.6167, lng: 37.1167 }
    };

    const normalizedPlaceName = placeName.toLowerCase().trim();
    const coordinates = cityCoordinates[normalizedPlaceName];

    if (coordinates) {
      const location: DriverLocation = {
        driverId: this.driverId,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        timestamp: new Date().toISOString()
      };

      this.currentLocation = location;
      
      // Update location for all assigned parcels
      this.assignedParcels.forEach(parcel => {
        this.updateLocationForParcel(parcel, placeName);
      });

      this.loading = false;
      console.log(`📍 Location updated to ${placeName}:`, coordinates);
    } else {
      this.loading = false;
      this.error = `Location "${placeName}" not found. Please try a different city name.`;
      console.log(`❌ Location not found: ${placeName}`);
    }
  }

  getLocationStatus(): string {
    if (!this.isTracking) return 'Not Tracking';
    if (this.currentLocation) return 'Tracking Active';
    return 'Starting...';
  }

  getLastUpdateTime(): string {
    if (!this.currentLocation) return 'Never';
    return new Date(this.currentLocation.timestamp).toLocaleTimeString();
  }

  getParcelMapUrl(parcel: Parcel): string {
    // For demo purposes, generate random coordinates near Nairobi
    const lat = -1.286389 + (Math.random() - 0.5) * 0.1;
    const lng = 36.817223 + (Math.random() - 0.5) * 0.1;
    return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  }

  openGoogleMaps() {
    if (this.currentLocation) {
      const url = `https://www.google.com/maps?q=${this.currentLocation.latitude},${this.currentLocation.longitude}`;
      window.open(url, '_blank');
    }
  }

  getStatusClass(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending') return 'status-pending';
    if (statusLower === 'delivered') return 'status-delivered';
    if (statusLower === 'in_transit' || statusLower === 'in transit') return 'status-in-transit';
    if (statusLower === 'cancelled') return 'status-cancelled';
    if (statusLower === 'picked_up' || statusLower === 'picked up') return 'status-picked-up';
    return '';
  }

  getStatusDisplayName(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending') return 'Pending';
    if (statusLower === 'delivered') return 'Delivered';
    if (statusLower === 'in_transit' || statusLower === 'in transit') return 'In Transit';
    if (statusLower === 'cancelled') return 'Cancelled';
    if (statusLower === 'picked_up' || statusLower === 'picked up') return 'Picked Up';
    return status;
  }
} 