import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Parcel } from '../models/parcels';

@Injectable({ providedIn: 'root' })
export class ParcelService {
  private apiUrl = 'http://localhost:3000/parcels';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getParcels(): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}`, { headers: this.getHeaders() });
  }

  getParcelById(id: string): Observable<Parcel> {
    return this.http.get<Parcel>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getPendingApprovals(): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/pending-approvals`, { headers: this.getHeaders() });
  }

  getApprovedParcels(): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/approved`, { headers: this.getHeaders() });
  }

  getRejectedParcels(): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/rejected`, { headers: this.getHeaders() });
  }

  // Get parcels sent by a specific user
  getParcelsBySender(userId: string): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/user/${userId}/sent`, { headers: this.getHeaders() });
  }

  // Get parcels received by a specific user
  getParcelsByRecipient(userId: string): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/user/${userId}/received`, { headers: this.getHeaders() });
  }

  // Get all parcels for a user (both sent and received)
  getParcelsForUser(userId: string): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/user/${userId}/all`, { headers: this.getHeaders() });
  }

  // Get pending approvals for a specific user
  getPendingApprovalsForUser(userId: string): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/user/${userId}/pending-approvals`, { headers: this.getHeaders() });
  }

  getParcelsByDriver(driverId: string): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}?assignedDriverId=${driverId}`, { headers: this.getHeaders() });
  }

  getUnassignedParcels(): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}?unassigned=true`, { headers: this.getHeaders() });
  }

  createParcel(parcel: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, parcel, { headers: this.getHeaders() });
  }

  updateParcelStatus(id: string, status: string): Observable<Parcel> {
    return this.http.patch<Parcel>(`${this.apiUrl}/${id}/status`, { status }, { headers: this.getHeaders() });
  }

  approveParcel(id: string, approvalStatus: string, rejectionReason?: string): Observable<Parcel> {
    const payload = { approvalStatus };
    if (rejectionReason) {
      (payload as any).rejectionReason = rejectionReason;
    }
    return this.http.patch<Parcel>(`${this.apiUrl}/${id}/approve`, payload, { headers: this.getHeaders() });
  }

  resubmitParcel(id: string, parcelData: any): Observable<Parcel> {
    return this.http.patch<Parcel>(`${this.apiUrl}/${id}/resubmit`, parcelData, { headers: this.getHeaders() });
  }

  assignDriverToParcel(parcelId: string, driverId: string | null): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${parcelId}`, { assignedDriverId: driverId }, { headers: this.getHeaders() });
  }

  deleteParcel(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/soft-delete`, { headers: this.getHeaders() });
  }

  getParcelByTrackingId(trackingId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tracking/${trackingId}`, { headers: this.getHeaders() });
  }
} 