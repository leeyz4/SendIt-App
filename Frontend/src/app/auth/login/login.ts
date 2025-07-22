import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';

  constructor(private router: Router) {}

  login() {
    if (this.email === 'admin@gmail.com' && this.password === 'admin123') {
      // Simulate admin login
      localStorage.setItem('role', 'admin');
      this.router.navigate(['/admin-dashboard']);
    } else if (this.email === 'driver@gmail.com' && this.password === 'driver123') {
      // Simulate driver login
      const driver = { email: this.email, role: 'driver', name: 'Driver One' };
      localStorage.setItem('role', 'driver');
      localStorage.setItem('currentUser', JSON.stringify(driver));
      this.router.navigate(['/driver-dashboard']);
    } else {
      // Check users in localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.email === this.email && u.password === this.password);
      if (user) {
        localStorage.setItem('role', 'user');
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.router.navigate(['/user-dashboard']);
      } else {
        alert('Invalid credentials');
      }
    }
  }
}
