import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  trackingNumber = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    console.log('Home component initialized');
    // Allow logged-in users to stay on home page with user navbar
  }

  trackParcel() {
    if (!this.trackingNumber.trim()) {
      alert('Please enter a tracking number');
      return;
    }

    // Store the tracking number in localStorage so the tracking page can access it
    localStorage.setItem('pendingTrackingNumber', this.trackingNumber);
    
    // Navigate to the parcel tracking page
    this.router.navigate(['/parcel-tracking']);
  }
}
