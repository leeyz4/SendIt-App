import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
// ===== CHANGES MADE TODAY (commented out for rollback) =====
// import { LandingNavbar } from '../../shared/landing-navbar/landing-navbar';
// import { LandingFooter } from '../../shared/landing-footer/landing-footer';
// ===== END CHANGES MADE TODAY =====

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;
  error = '';
  success = '';
  agreeToTerms = false;
  
  // Password visibility toggles
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // Password visibility toggle methods
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  register() {
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    if (!this.firstName || !this.lastName || !this.email || !this.password) {
      this.error = 'Please fill in all fields';
      return;
    }

    // Frontend validation to match backend requirements
    if (this.firstName.length < 3) {
      this.error = 'First name must be at least 3 characters long';
      return;
    }

    if (this.lastName.length < 3) {
      this.error = 'Last name must be at least 3 characters long';
      return;
    }

    // Backend expects password to be at least 5 characters (not 6)
    if (this.password.length < 5) {
      this.error = 'Password must be at least 5 characters long';
      return;
    }

    // Check if password contains both letters and numbers (matches backend regex)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/;
    if (!passwordRegex.test(this.password)) {
      this.error = 'Password must contain both letters and numbers';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    // Combine firstName and lastName for backend
    const fullName = `${this.firstName} ${this.lastName}`.trim();

    const userData = {
      name: fullName,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword
    };

    // Debug: Log the data being sent
    console.log('Sending registration data:', userData);

    this.authService.register(userData).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.success = 'Registration successful! Please check your email for verification code.';
        this.loading = false;
        
        // Store email for verification page
        localStorage.setItem('pendingVerificationEmail', this.email);
        
        // Redirect to verification page after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/verify']);
        }, 2000);
      },
      error: (err) => {
        console.error('Registration error:', err);
        console.error('Error response:', err.error);
        
        // Handle different types of error responses
        if (err.error && typeof err.error === 'object') {
          // Backend validation errors
          if (err.error.message) {
            this.error = err.error.message;
          } else if (err.error.error) {
            this.error = err.error.error;
          } else {
            this.error = 'Registration failed. Please check your input and try again.';
          }
        } else if (typeof err.error === 'string') {
          this.error = err.error;
        } else {
          this.error = 'Registration failed. Please try again.';
        }
        
        this.loading = false;
      }
    });
  }
}
