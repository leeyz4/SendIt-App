import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserSidebar } from '../../shared/user-sidebar/user-sidebar';
import { LocationService, DriverLocation } from '../../services/location.service';
import { ParcelService } from '../../services/parcel.service';
import { Parcel } from '../../models/parcels';
import { Subscription, interval } from 'rxjs';
import * as L from 'leaflet';

@Component({
  selector: 'app-parcel-tracking',
  standalone: true,
  imports: [FormsModule, CommonModule, UserSidebar],
  templateUrl: './parcel-tracking.html',
  styleUrls: ['./parcel-tracking.css']
})
export class ParcelTracking implements OnInit, AfterViewInit, OnDestroy {
  trackingNumber = '';
  map: L.Map | undefined;
  driverMarker: L.Marker | undefined;
  parcelMarker: L.Marker | undefined;
  
  currentParcel: Parcel | null = null;
  driverLocation: DriverLocation | null = null;
  isTracking = false;
  loading = false;
  error = '';
  
  private locationSubscription: Subscription | undefined;
  private trackingInterval: Subscription | undefined;

  constructor(
    private router: Router,
    private locationService: LocationService,
    private parcelService: ParcelService
  ) {}

  ngOnInit() {
    // Start periodic location updates for any active tracking
    this.startPeriodicLocationUpdates();
    
    // Check if there's a pending tracking number from the home page
    const pendingTrackingNumber = localStorage.getItem('pendingTrackingNumber');
    if (pendingTrackingNumber) {
      this.trackingNumber = pendingTrackingNumber;
      localStorage.removeItem('pendingTrackingNumber'); // Clear it after use
      
      // Automatically track the parcel
      setTimeout(() => {
        this.trackParcel();
      }, 100); // Small delay to ensure component is fully initialized
    }
  }

  ngAfterViewInit() {
    this.initializeMap();
  }

  ngOnDestroy() {
    if (this.locationSubscription) {
      this.locationSubscription.unsubscribe();
    }
    if (this.trackingInterval) {
      this.trackingInterval.unsubscribe();
    }
  }

  initializeMap() {
    // Default to Nairobi
    const defaultLat = -1.286389;
    const defaultLng = 36.817223;
    
    this.map = L.map('map').setView([defaultLat, defaultLng], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add driver marker (blue)
    this.driverMarker = L.marker([defaultLat, defaultLng], {
      icon: L.divIcon({
        className: 'driver-marker',
        html: '<div style="background-color: #007bff; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })
    }).addTo(this.map);

    // Add parcel marker (green)
    this.parcelMarker = L.marker([defaultLat, defaultLng], {
      icon: L.divIcon({
        className: 'parcel-marker',
        html: '<div style="background-color: #28a745; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.3);"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })
    }).addTo(this.map);

    this.driverMarker.bindPopup('Driver Location').openPopup();
    this.parcelMarker.bindPopup('Parcel Location').openPopup();
  }

  trackParcel() {
    if (!this.trackingNumber.trim()) {
      this.error = 'Please enter a tracking number.';
      return;
    }

    this.loading = true;
    this.error = '';

    // First, find the parcel by tracking number
    this.parcelService.getParcels().subscribe({
      next: (parcels) => {
        const parcel = parcels.find(p => p.trackingId === this.trackingNumber);
        
        if (!parcel) {
          this.error = 'Tracking number not found.';
          this.loading = false;
          return;
        }

        this.currentParcel = parcel;
        this.updateParcelMarker(parcel);
        
        // Load and display location history
        this.loadParcelLocationHistory(parcel.id);

        // If parcel has an assigned driver, track driver location
        if (parcel.assignedDriverId) {
          this.startDriverTracking(parcel.assignedDriverId);
        } else {
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Error tracking parcel:', err);
        this.error = 'Failed to track parcel.';
        this.loading = false;
      }
    });
  }

  startDriverTracking(driverId: string) {
    this.isTracking = true;
    this.loading = false;

    // Get initial driver location
    this.locationService.getDriverLocation(driverId).subscribe({
      next: (location) => {
        this.driverLocation = {
          driverId: location.driverId,
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: location.timestamp
        };
        this.updateDriverMarker(this.driverLocation);
        this.centerMapOnDriver();
      },
      error: (err) => {
        console.error('Error getting driver location:', err);
        // Use mock location for demo
        this.driverLocation = {
          driverId,
          latitude: -1.286389 + (Math.random() - 0.5) * 0.1,
          longitude: 36.817223 + (Math.random() - 0.5) * 0.1,
          timestamp: new Date().toISOString()
        };
        this.updateDriverMarker(this.driverLocation);
        this.centerMapOnDriver();
      }
    });
  }

  startPeriodicLocationUpdates() {
    // Update location every 30 seconds if tracking
    this.trackingInterval = interval(30000).subscribe(() => {
      if (this.isTracking && this.currentParcel?.assignedDriverId) {
        this.locationService.getDriverLocation(this.currentParcel.assignedDriverId).subscribe({
          next: (location) => {
            this.driverLocation = {
              driverId: location.driverId,
              latitude: location.latitude,
              longitude: location.longitude,
              timestamp: location.timestamp
            };
            this.updateDriverMarker(this.driverLocation);
          },
          error: (err) => {
            console.error('Error updating driver location:', err);
          }
        });
      }
    });
  }

  updateDriverMarker(location: DriverLocation) {
    if (this.driverMarker && this.map) {
      this.driverMarker.setLatLng([location.latitude, location.longitude]);
      this.driverMarker.setPopupContent(
        `Driver Location<br>
         Updated: ${new Date(location.timestamp).toLocaleTimeString()}<br>
         Coordinates: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
      );
    }
  }

  updateParcelMarker(parcel: Parcel) {
    if (this.parcelMarker && this.map) {
      // Mock parcel location (in real app, get from parcel data)
      const lat = -1.286389 + (Math.random() - 0.5) * 0.1;
      const lng = 36.817223 + (Math.random() - 0.5) * 0.1;
      
      this.parcelMarker.setLatLng([lat, lng]);
      this.parcelMarker.setPopupContent(
        `Parcel: ${parcel.trackingId}<br>
         Status: ${parcel.status}<br>
         Destination: ${parcel.destination}`
      );
    }
  }

  centerMapOnDriver() {
    if (this.driverLocation && this.map) {
      this.map.setView([this.driverLocation.latitude, this.driverLocation.longitude], 15);
    }
  }

  getDriverStatus(): string {
    if (!this.isTracking) return 'Not Tracking';
    if (this.driverLocation) return 'Driver Found';
    return 'Searching...';
  }

  getLastUpdateTime(): string {
    if (!this.driverLocation) return 'Never';
    return new Date(this.driverLocation.timestamp).toLocaleTimeString();
  }

  getEstimatedDelivery(): string {
    if (!this.currentParcel || !this.driverLocation) return 'Unknown';
    
    // Mock estimated delivery time (in real app, calculate based on distance and traffic)
    const now = new Date();
    const estimated = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    return estimated.toLocaleTimeString();
  }

  loadParcelLocationHistory(parcelId: string) {
    this.locationService.getParcelLocationHistory(parcelId).subscribe({
      next: (locationHistory) => {
        console.log('📍 Loaded location history:', locationHistory);
        this.displayLocationHistory(locationHistory);
      },
      error: (err) => {
        console.error('Error loading location history:', err);
      }
    });
  }

  displayLocationHistory(locationHistory: any[]) {
    console.log('🗺️ Displaying location history:', locationHistory);
    
    if (!this.map) {
      console.log('❌ Map not initialized');
      return;
    }
    
    if (locationHistory.length === 0) {
      console.log('❌ No location history to display');
      return;
    }

    // Clear existing route and markers
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Polyline) {
        this.map!.removeLayer(layer);
      }
      // Remove history markers by checking if they have the history-marker class
      if (layer instanceof L.Marker) {
        const element = layer.getElement();
        if (element && element.querySelector('.history-marker')) {
          this.map!.removeLayer(layer);
        }
      }
    });

    // Create route polyline
    const routePoints = locationHistory.map(location => [location.latitude, location.longitude]);
    console.log('📍 Route points:', routePoints);
    
    if (routePoints.length > 1 && this.map) {
      const routePolyline = L.polyline(routePoints as [number, number][], {
        color: '#007bff',
        weight: 4,
        opacity: 0.7
      }).addTo(this.map);
      console.log('🔵 Blue polyline added');

      // Add markers for each location update
      locationHistory.forEach((location, index) => {
        if (this.map) {
          const marker = L.marker([location.latitude, location.longitude], {
            icon: L.divIcon({
              className: 'history-marker',
              html: `<div style="background-color: #ffc107; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.3);"></div>`,
              iconSize: [12, 12],
              iconAnchor: [6, 6]
            })
          }).addTo(this.map);

          const popupContent = `
            <strong>Location Update ${index + 1}</strong><br>
            ${location.address ? `📍 ${location.address}<br>` : ''}
            📅 ${new Date(location.timestamp).toLocaleString()}<br>
            📍 ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}
          `;
          marker.bindPopup(popupContent);
          console.log(`🟡 Yellow marker ${index + 1} added at:`, location.latitude, location.longitude);
        }
      });

      // Fit map to show entire route
      this.map.fitBounds(routePolyline.getBounds());
      console.log('🗺️ Map fitted to route bounds');
    } else {
      console.log('❌ Not enough points for polyline or map not available');
    }
  }
}
