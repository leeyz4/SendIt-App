import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, NavigationEnd, Router } from '@angular/router';
import { LandingNavbar } from './shared/landing-navbar/landing-navbar';
import { LandingFooter } from './shared/landing-footer/landing-footer';
import { CommonModule } from '@angular/common';
import { UserNavbar } from './shared/user-navbar/user-navbar';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, LandingFooter, LandingNavbar, UserNavbar, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  isLandingPage = false;
  isDashboardPage = false;
  role: 'user' | 'admin' | 'driver' | null = null;
  showFooter = true;
  showNavbar = true;
  showLandingFooter = true;
  
  constructor(private router: Router, private authService: AuthService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url = event.url;
        
        // Check if user is logged in and get role
        const isLoggedIn = this.authService.isLoggedIn();
        this.role = this.authService.getRole()?.toLowerCase() as 'user' | 'admin' | 'driver' | null;
        
        // Check if it's a dashboard page (sidebar should show instead of navbar)
        this.isDashboardPage = url.includes('/user-dashboard') || 
                               url.includes('/admin-dashboard') || 
                               url.includes('/driver-deliveries') ||
                               url.includes('/driver-completed') ||
                               url.includes('/driver-location') ||
                               url.includes('/driver-profile') ||
                               url.includes('/admin-parcels') ||
                               url.includes('/admin-users') ||
                               url.includes('/admin-drivers') ||
                               url.includes('/create-delivery') ||
                               url.includes('/delivery-history') ||
                               url.includes('/parcel-details') ||
                               url.includes('/parcel-tracking') ||
                               url.includes('/profile') ||
                               url.includes('/delivery-details') ||
                               url.includes('/approved-deliveries') ||
                               url.includes('/rejected-deliveries') ||
                               url.includes('/delivery-approval');
        
        // Check if it's a landing page (only for non-logged-in users)
        this.isLandingPage = (
          url === '/' ||
          url === '/home' || // Landing navbar for home only if not logged in
          url === '/services' ||
          url === '/about-us' ||
          url === '/contact' ||
          url === '/login' ||
          url === '/register' 
        );
        
        // Show footer only for landing pages and non-dashboard pages, but not for driver pages
        this.showLandingFooter = this.isLandingPage || (!this.isDashboardPage && isLoggedIn && this.role !== 'driver');
        
        // Debug logging
        console.log('Navigation Debug:', {
          url,
          isLoggedIn,
          role: this.role,
          isLandingPage: this.isLandingPage,
          isDashboardPage: this.isDashboardPage,
          shouldShowLandingNavbar: this.isLandingPage,
          shouldShowUserNavbar: !this.isLandingPage && this.role?.toLowerCase() === 'user' && !this.isDashboardPage,
          shouldShowAdminNavbar: !this.isLandingPage && this.role?.toLowerCase() === 'admin' && !this.isDashboardPage,
          shouldShowDriverNavbar: !this.isLandingPage && this.role?.toLowerCase() === 'driver' && !this.isDashboardPage
        });
      }
    });
  }
}
