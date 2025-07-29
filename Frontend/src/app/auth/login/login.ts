import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  loading = false;
  error = '';
  rememberMe = false;
  
  // Password visibility toggle
  showPassword = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // Password visibility toggle method
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  login() {
    if (!this.email || !this.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.error = '';

    // Use real backend authentication
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        
        // Save login data
        this.authService.saveLogin(response.user.role, response.access_token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));

        // setTimeout(() => {
        //   this.router.navigate(['/home']);
        // }, 100);                          //
        
        this.loading = false;
        
        // Redirect based on role
        switch (response.user.role) {
          case 'ADMIN':
            this.router.navigate(['/admin-dashboard']);
            break;
          case 'DRIVER':
            this.router.navigate(['/driver-deliveries']);
            break;
          case 'USER':
          default:
            this.router.navigate(['/user-dashboard']); // User goes to home page with user navbar
            break;
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.loading = false;
        
        if (err.error && typeof err.error === 'object') {
          if (err.error.message) {
            this.error = err.error.message;
          } else if (err.error.error) {
            this.error = err.error.error;
          } else {
            this.error = 'Login failed. Please check your credentials.';
          }
        } else if (typeof err.error === 'string') {
          this.error = err.error;
        } else {
          this.error = 'Login failed. Please try again.';
        }
      }
    });
  }
}
