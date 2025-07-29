import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './user-navbar.html',
  styleUrl: './user-navbar.css'
})
export class UserNavbar {
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
