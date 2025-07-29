import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Driver } from '../models/drivers';

@Injectable({ providedIn: 'root' })
export class DriverService {
  private apiUrl = 'http://localhost:3000/drivers';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getDrivers(): Observable<Driver[]> {
    console.log('🚗 Fetching drivers from:', `${this.apiUrl}`);
    console.log('🔑 Headers:', this.getHeaders());
    return this.http.get<any>(`${this.apiUrl}`, { headers: this.getHeaders() });
  }

  getDriverById(id: string): Observable<Driver> {
    return this.http.get<Driver>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  updateDriverStatus(id: string, status: string): Observable<Driver> {
    return this.http.patch<Driver>(`${this.apiUrl}/${id}/status`, { status }, { headers: this.getHeaders() });
  }

  createDriver(driver: any): Observable<Driver> {
    return this.http.post<Driver>(`${this.apiUrl}`, driver, { headers: this.getHeaders() });
  }

  updateDriver(id: string, driver: any): Observable<Driver> {
    return this.http.patch<Driver>(`${this.apiUrl}/${id}`, driver, { headers: this.getHeaders() });
  }

  deleteDriver(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/hard-delete`, { headers: this.getHeaders() });
  }
} 