import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = 'http://localhost:3000/notification';

  constructor(private http: HttpClient) {}

  getNotifications(userId: string): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}?userId=${userId}`);
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${notificationId}`, { read: true });
  }

  createNotification(data: any): Observable<Notification> {
    return this.http.post<Notification>(this.apiUrl, data);
  }
} 