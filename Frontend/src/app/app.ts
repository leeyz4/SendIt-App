import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth';
import { LandingNavbar } from './shared/landing-navbar/landing-navbar';
import { LandingFooter } from './shared/landing-footer/landing-footer';
import { AdminNavbar } from './shared/admin-navbar/admin-navbar';
import { UserNavbar } from './shared/user-navbar/user-navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, LandingFooter, LandingNavbar, AdminNavbar, UserNavbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  isLandingPage = false;
  role: 'user' | 'admin' | null = null;
  showFooter = true;
  showNavbar = true;
  showLandingFooter = true;

  constructor(private router: Router, private authService: AuthService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url = event.url;

        // Check for login or register routes
        const isAuthPage = url.includes('/login') || url.includes('/register');

        this.isLandingPage = url === '/' || url === '/home';
        this.role = this.authService.getRole();

        // Show navbar only if not on login/register
        this.showNavbar = !isAuthPage;

        // Show footer only if not on login/register
        this.showLandingFooter =
          !isAuthPage && (this.isLandingPage || this.role === 'user' || this.role === 'admin');
      }
    });
  }
}
