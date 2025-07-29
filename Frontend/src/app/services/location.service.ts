import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';

export interface Location {
  id: string;
  driverId: string;
  parcelId?: string; // Make parcelId optional
  latitude: number;
  longitude: number;
  timestamp: string;
  address?: string;
}

export interface DriverLocation {
  driverId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  address?: string;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private apiUrl = 'http://localhost:3000/locations';
  private currentLocationSubject = new BehaviorSubject<DriverLocation | null>(null);
  public currentLocation$ = this.currentLocationSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Get current location from browser
  getCurrentLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation is not supported by this browser.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Update driver location (deprecated - use updateParcelLocation instead)
  updateDriverLocation(driverId: string, latitude: number, longitude: number): Observable<Location> {
    console.warn('updateDriverLocation is deprecated - use updateParcelLocation instead');
    
    // Return a mock response since the endpoint doesn't exist
    return of({
      id: `loc_${Date.now()}`,
      driverId,
      parcelId: undefined,
      latitude,
      longitude,
      timestamp: new Date().toISOString()
    });
  }

  // Get driver location
  getDriverLocation(driverId: string): Observable<Location> {
    return this.http.get<Location>(`${this.apiUrl}/driver/${driverId}`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.warn('Location service not available, returning mock location for driver:', driverId);
        // Return a mock response if the backend endpoint doesn't exist
        return of({
          id: `loc_${Date.now()}`,
          driverId: driverId,
          parcelId: undefined,
          latitude: -1.286389, // Default to Nairobi
          longitude: 36.817223,
          timestamp: new Date().toISOString()
        });
      })
    );
  }

  // Get parcel location (driver assigned to parcel)
  getParcelLocation(parcelId: string): Observable<Location> {
    return this.http.get<Location>(`${this.apiUrl}/parcel/${parcelId}`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.warn('Location service not available, returning mock location for parcel:', parcelId);
        // Return a mock response if the backend endpoint doesn't exist
        return of({
          id: `loc_${Date.now()}`,
          driverId: 'mock-driver-id',
          parcelId: parcelId,
          latitude: -1.286389, // Default to Nairobi
          longitude: 36.817223,
          timestamp: new Date().toISOString()
        });
      })
    );
  }

  // Start real-time location tracking for driver
  startLocationTracking(driverId: string): Observable<DriverLocation> {
    return interval(30000).pipe( // Update every 30 seconds
      switchMap(() => this.getCurrentLocation()),
      switchMap(position => {
        const location: DriverLocation = {
          driverId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString()
        };
        
        this.currentLocationSubject.next(location);
        return this.updateDriverLocation(driverId, location.latitude, location.longitude);
      }),
      tap(location => {
        const driverLocation: DriverLocation = {
          driverId: location.driverId,
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: location.timestamp
        };
        this.currentLocationSubject.next(driverLocation);
      })
    );
  }

  // Stop location tracking
  stopLocationTracking() {
    // This would typically involve unsubscribing from the observable
    // The actual implementation depends on how you're managing the subscription
  }

  // Update parcel location (for specific parcel tracking)
  updateParcelLocation(parcelId: string, driverId: string, latitude: number, longitude: number, locationName?: string): Observable<Location> {
    const location = {
      driverId,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
      locationName
    };

    return this.http.post<Location>(`${this.apiUrl}/parcel/${parcelId}`, location, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.warn('Parcel location service not available, logging location locally:', location);
        return of({
          id: `loc_${Date.now()}`,
          driverId,
          parcelId,
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
          address: locationName
        });
      })
    );
  }

  // Get parcel location history (for drawing route/polyline)
  getParcelLocationHistory(parcelId: string): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiUrl}/parcel/${parcelId}/history`, { headers: this.getHeaders() }).pipe(
      catchError(error => {
        console.warn('Parcel location history service not available, returning empty array for parcel:', parcelId);
        return of([]);
      })
    );
  }

  // Get address from coordinates (reverse geocoding)
  getAddressFromCoordinates(latitude: number, longitude: number): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/geocode?lat=${latitude}&lng=${longitude}`, { headers: this.getHeaders() });
  }
} 