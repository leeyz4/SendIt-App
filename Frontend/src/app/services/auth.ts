import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  // Save login info to localStorage
  login(role: 'admin' | 'user', token: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
  }

  // Get the saved role
  getRole(): 'admin' | 'user' | null {
    const role = localStorage.getItem('role');
    if (role === 'admin' || role === 'user') {
      return role;
    }
    return null;
  }

  // Get the token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  }
}
