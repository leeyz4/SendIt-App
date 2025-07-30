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
  routeLine: L.Polyline | undefined;
  
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
    // Default to a wider view of Kenya to show the route better
    const defaultLat = -0.5; // Center of Kenya
    const defaultLng = 37.5; // Center of Kenya
    
    this.map = L.map('map').setView([defaultLat, defaultLng], 7);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: ''
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
        // Use mock location near pickup location for demo
        if (this.currentParcel) {
          const coordinates = this.getLocationCoordinates(this.currentParcel.pickupLocation, this.currentParcel.destination);
          this.driverLocation = {
            driverId,
            latitude: coordinates.pickup.lat + (Math.random() - 0.5) * 0.01, // Small random offset
            longitude: coordinates.pickup.lng + (Math.random() - 0.5) * 0.01,
            timestamp: new Date().toISOString()
          };
        } else {
          // Fallback to Nairobi if no parcel
          this.driverLocation = {
            driverId,
            latitude: -1.286389 + (Math.random() - 0.5) * 0.1,
            longitude: 36.817223 + (Math.random() - 0.5) * 0.1,
            timestamp: new Date().toISOString()
          };
        }
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
            // Use mock location near pickup location for demo
            if (this.currentParcel && this.currentParcel.assignedDriverId) {
              const coordinates = this.getLocationCoordinates(this.currentParcel.pickupLocation, this.currentParcel.destination);
              this.driverLocation = {
                driverId: this.currentParcel.assignedDriverId,
                latitude: coordinates.pickup.lat + (Math.random() - 0.5) * 0.01,
                longitude: coordinates.pickup.lng + (Math.random() - 0.5) * 0.01,
                timestamp: new Date().toISOString()
              };
              this.updateDriverMarker(this.driverLocation);
            }
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
      // Get coordinates for the pickup location
      const coordinates = this.getLocationCoordinates(parcel.pickupLocation, parcel.destination);
      
      // Center map on pickup location
      this.map.setView([coordinates.pickup.lat, coordinates.pickup.lng], 10);
      
      // Set parcel marker at pickup location
      this.parcelMarker.setLatLng([coordinates.pickup.lat, coordinates.pickup.lng]);
      this.parcelMarker.setPopupContent(
        `Parcel: ${parcel.trackingId}<br>
         Status: ${parcel.status}<br>
         Pickup: ${parcel.pickupLocation}<br>
         Destination: ${parcel.destination}`
      );
      
      // Draw route line from pickup to destination
      this.drawRouteLine(parcel);
    }
  }

  centerMapOnDriver() {
    if (this.driverLocation && this.map) {
      this.map.setView([this.driverLocation.latitude, this.driverLocation.longitude], 15);
    }
  }

  drawRouteLine(parcel: Parcel) {
    if (!this.map) return;

    // Remove existing route line
    if (this.routeLine) {
      this.map.removeLayer(this.routeLine);
    }

    // Get coordinates based on pickup and destination locations
    const coordinates = this.getLocationCoordinates(parcel.pickupLocation, parcel.destination);
    
    const pickupLat = coordinates.pickup.lat;
    const pickupLng = coordinates.pickup.lng;
    const destLat = coordinates.destination.lat;
    const destLng = coordinates.destination.lng;

    // Create route line from pickup to destination
    this.routeLine = L.polyline([
      [pickupLat, pickupLng],
      [destLat, destLng]
    ], {
      color: '#ff6b35',
      weight: 4,
      opacity: 0.8,
      dashArray: '10, 5'
    }).addTo(this.map);

    // Add markers for pickup and destination
    const pickupMarker = L.marker([pickupLat, pickupLng], {
      icon: L.divIcon({
        className: 'pickup-marker',
        html: '<div style="background-color: #28a745; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.3);"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })
    }).addTo(this.map);

    const destMarker = L.marker([destLat, destLng], {
      icon: L.divIcon({
        className: 'destination-marker',
        html: '<div style="background-color: #dc3545; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.3);"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })
    }).addTo(this.map);

    pickupMarker.bindPopup(`Pickup: ${parcel.pickupLocation}`).openPopup();
    destMarker.bindPopup(`Destination: ${parcel.destination}`).openPopup();

    // Fit map to show the entire route
    this.map.fitBounds(this.routeLine.getBounds());
  }

  getLocationCoordinates(pickupLocation: string, destination: string) {
    // Map of Kenyan cities to coordinates
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

    // Normalize location names (lowercase and trim)
    const normalizedPickup = pickupLocation.toLowerCase().trim();
    const normalizedDest = destination.toLowerCase().trim();

    // Get coordinates for pickup and destination
    const pickupCoords = cityCoordinates[normalizedPickup] || { lat: -1.286389, lng: 36.817223 }; // Default to Nairobi
    const destCoords = cityCoordinates[normalizedDest] || { lat: -1.286389, lng: 36.817223 }; // Default to Nairobi

    return {
      pickup: pickupCoords,
      destination: destCoords
    };
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
