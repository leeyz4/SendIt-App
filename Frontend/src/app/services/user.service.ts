import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/users';
import { tap, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('Frontend: Getting headers, token exists:', !!token);
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl, { headers: this.getHeaders() });
  }

  getUsersIncludingDeleted(): Observable<User[]> {
    console.log('Frontend: Calling getUsersIncludingDeleted...');
    return this.http.get<User[]>(`${this.apiUrl}/all-including-deleted`, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('Frontend: getUsersIncludingDeleted response:', response)),
      catchError(error => {
        console.error('Frontend: Error in getUsersIncludingDeleted:', error);
        throw error;
      })
    );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  findByEmail(email: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Search?email=${email}`, { headers: this.getHeaders() });
  }

  createUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, user, { headers: this.getHeaders() });
  }

  updateUser(id: string, userData: any): Observable<any> {
    console.log('Updating user:', id, 'with data:', userData);
    return this.http.patch<any>(`${this.apiUrl}/${id}`, userData, { headers: this.getHeaders() });
  }

  deleteUser(id: string): Observable<any> {
    console.log('Deleting user:', id);
    return this.http.patch<any>(`${this.apiUrl}/${id}/soft-delete`, {}, { headers: this.getHeaders() });
  }

  hardDeleteUser(id: string): Observable<any> {
    console.log('Frontend: Hard deleting user:', id);
    return this.http.delete<any>(`${this.apiUrl}/${id}/hard-delete`, { headers: this.getHeaders() }).pipe(
      tap(response => console.log('Frontend: Hard delete response:', response)),
      catchError(error => {
        console.error('Frontend: Error in hardDeleteUser:', error);
        console.error('Frontend: Error details:', error.error);
        console.error('Frontend: Error status:', error.status);
        throw error;
      })
    );
  }

  restoreUser(id: string): Observable<any> {
    console.log('Restoring user:', id);
    return this.http.patch<any>(`${this.apiUrl}/${id}/restore`, {}, { headers: this.getHeaders() });
  }
} 