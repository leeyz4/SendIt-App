import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-driver-navbar',
  imports: [RouterModule, CommonModule],
  templateUrl: './driver-navbar.html',
  styleUrl: './driver-navbar.css'
})
export class DriverNavbar {
  isDropdownOpen = false;

  constructor(private router: Router) {}

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  goToProfile() {
    this.router.navigate(['/profile']);
    this.isDropdownOpen = false;
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
    this.isDropdownOpen = false;
  }
}
