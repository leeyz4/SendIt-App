import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-driver-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './driver-sidebar.html',
  styleUrl: './driver-sidebar.css'
})
export class DriverSidebar {
  isCollapsed = false;

  constructor(private router: Router) {}

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  logout() {
    localStorage.removeItem('role');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
} 