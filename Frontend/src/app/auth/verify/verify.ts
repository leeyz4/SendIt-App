import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify.html',
  styleUrl: './verify.css'
})
export class Verify implements OnInit {
  verificationCode = '';
  email = '';
  loading = false;
  error = '';
  success = '';
  resendDisabled = false;
  resendCountdown = 0;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Get email from localStorage (set during registration)
    this.email = localStorage.getItem('pendingVerificationEmail') || '';
    if (!this.email) {
      this.router.navigate(['/register']);
    }
  }

  verifyCode() {
    if (!this.verificationCode.trim()) {
      this.error = 'Please enter the verification code.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.verifyEmail(this.email, this.verificationCode).subscribe({
      next: (response) => {
        this.success = 'Email verified successfully! Redirecting to login...';
        this.loading = false;
        
        // Clear pending verification email
        localStorage.removeItem('pendingVerificationEmail');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('Verification error:', err);
        this.error = 'Invalid verification code. Please try again.';
        this.loading = false;
      }
    });
  }

  resendCode() {
    this.loading = true;
    this.error = '';

    this.authService.resendVerificationCode(this.email).subscribe({
      next: (response) => {
        this.success = 'Verification code resent successfully!';
        this.loading = false;
        this.startResendCountdown();
      },
      error: (err) => {
        console.error('Resend error:', err);
        this.error = 'Failed to resend verification code. Please try again.';
        this.loading = false;
      }
    });
  }

  startResendCountdown() {
    this.resendDisabled = true;
    this.resendCountdown = 60;
    
    const countdown = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        this.resendDisabled = false;
        clearInterval(countdown);
      }
    }, 1000);
  }

  goToLogin() {
    localStorage.removeItem('pendingVerificationEmail');
    this.router.navigate(['/login']);
  }

  goToRegister() {
    localStorage.removeItem('pendingVerificationEmail');
    this.router.navigate(['/register']);
  }
} 