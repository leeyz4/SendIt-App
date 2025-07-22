import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css'
})
export class AdminUsers {
  searchTerm = '';
  selectedStatus = '';
  users = JSON.parse(localStorage.getItem('users') || '[]');

  get filteredUsers() {
    const term = this.searchTerm.toLowerCase();
    return this.users.filter((u: any) =>
      (u.firstName.toLowerCase().includes(term) ||
       u.lastName.toLowerCase().includes(term) ||
       u.email.toLowerCase().includes(term)) &&
      (this.selectedStatus && this.selectedStatus !== 'All' ? (u.status === this.selectedStatus) : true)
    );
  }
}
