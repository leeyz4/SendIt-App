import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './admin-navbar.html',
  styleUrls: ['./admin-navbar.css']
})
export class AdminNavbar {
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
