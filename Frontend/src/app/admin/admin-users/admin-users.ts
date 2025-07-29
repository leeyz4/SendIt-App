import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminSidebar } from '../../shared/admin-sidebar/admin-sidebar';
import { UserService } from '../../services/user.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebar],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css'
})
export class AdminUsers implements OnInit {
  searchTerm = '';
  selectedStatus = 'All';
  showDeletedUsers = false; // Add toggle for showing deleted users
  users: any[] = [];
  loading = false;
  error = '';

  // Live stat cards
  totalUsers = 0;
  activeUsers = 0;
  newRegistrations = 0;
  deactivatedUsers = 0;

  constructor(
    private userService: UserService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.checkCurrentUserRole();
    this.loadUsers();
  }

  checkCurrentUserRole() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Current user payload:', payload);
        console.log('Current user role:', payload.role);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }

  loadUsers() {
    this.loading = true;
    this.error = '';

    console.log('Admin: Loading users, showDeletedUsers:', this.showDeletedUsers);

    // Choose the appropriate service method based on showDeletedUsers flag
    const userObservable = this.showDeletedUsers 
      ? this.userService.getUsersIncludingDeleted()
      : this.userService.getUsers();

    userObservable.subscribe({
      next: (response: any) => {
        console.log('Admin: Users response:', response);
        if (response.success) {
          this.users = response.data || [];
          console.log('Admin: Loaded users:', this.users.length);
          this.calculateStats();
        } else {
          console.error('Admin: Failed to load users:', response.message);
          this.error = response.message || 'Failed to load users';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Admin: Error loading users:', err);
        console.error('Admin: Error details:', err.error);
        console.error('Admin: Error status:', err.status);
        this.error = `Failed to load users: ${err.status} ${err.statusText}`;
        this.loading = false;
      }
    });
  }

  calculateStats() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    this.totalUsers = this.users.length;
    this.activeUsers = this.users.filter(user => user.isVerified && !user.deletedAt).length;
    this.newRegistrations = this.users.filter(user => {
      try {
        // Check if createdAt exists and is valid
        if (!user.createdAt) return false;
        
        const createdDate = new Date(user.createdAt);
        // Check if the date is valid
        if (isNaN(createdDate.getTime())) return false;
        
        const createdDateStr = createdDate.toISOString().split('T')[0];
        return createdDateStr === todayStr;
      } catch (error) {
        console.error('Error parsing date for user:', user.id, error);
        return false;
      }
    }).length;
    this.deactivatedUsers = this.users.filter(user => user.deletedAt || !user.isVerified).length;
  }

  get filteredUsers() {
    const term = this.searchTerm.toLowerCase();
    return this.users.filter((user: any) => {
      const matchesSearch = user.name.toLowerCase().includes(term) ||
                           user.email.toLowerCase().includes(term);
      
      const matchesStatus = this.selectedStatus === 'All' || 
                           (this.selectedStatus === 'Active' && user.isVerified && !user.deletedAt) ||
                           (this.selectedStatus === 'Deactivated' && (user.deletedAt || !user.isVerified)) ||
                           (this.selectedStatus === 'New' && this.isNewUser(user));
      
      return matchesSearch && matchesStatus;
    });
  }

  isNewUser(user: any): boolean {
    const today = new Date();
    const createdDate = new Date(user.createdAt);
    const diffTime = Math.abs(today.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7; // New users registered in the last 7 days
  }

  toggleUserStatus(user: any) {
    console.log('Toggling user status for:', user);
    const newStatus = user.isVerified ? false : true;
    console.log('New status will be:', newStatus);
    
    this.userService.updateUser(user.id, { isVerified: newStatus }).subscribe({
      next: (response: any) => {
        console.log('User status updated response:', response);
        if (response.success) {
          console.log('User status updated successfully');
          
          // Update the local user object immediately
          const userIndex = this.users.findIndex(u => u.id === user.id);
          if (userIndex !== -1) {
            this.users[userIndex].isVerified = newStatus;
            console.log('Updated local user object:', this.users[userIndex]);
          }
          
          // Recalculate stats
          this.calculateStats();
          
          // Show success message
          this.alertService.success(`User ${user.name} has been ${newStatus ? 'activated' : 'deactivated'} successfully!`);
        } else {
          console.error('Failed to update user status:', response.message);
          this.alertService.error('Failed to update user status: ' + response.message);
        }
      },
      error: (err: any) => {
        console.error('Error updating user status:', err);
        this.alertService.error('Failed to update user status. Please try again.');
      }
    });
  }

  deleteUser(user: any) {
    console.log('Deleting user:', user);
    
    // Show options for delete type using custom alert
    this.alertService.confirm(
      `Delete user ${user.name}?\n\nClick "Yes" for SOFT DELETE (can be restored)\nClick "No" for HARD DELETE (permanent)`,
      'Delete User'
    ).then((isSoftDelete) => {
      if (isSoftDelete) {
        // Soft delete
        this.alertService.confirm(
          `Are you sure you want to SOFT DELETE user ${user.name}? This will deactivate the user but can be restored.`,
          'Confirm Soft Delete'
        ).then((confirmed) => {
          if (confirmed) {
            this.userService.deleteUser(user.id).subscribe({
              next: (response: any) => {
                console.log('User soft deleted response:', response);
                if (response.success) {
                  console.log('User soft deleted successfully');
                  this.loadUsers(); // Reload to update stats
                  this.alertService.success('User has been soft deleted successfully!');
                } else {
                  console.error('Failed to soft delete user:', response.message);
                  this.alertService.error('Failed to soft delete user: ' + response.message);
                }
              },
              error: (err: any) => {
                console.error('Error soft deleting user:', err);
                this.alertService.error('Failed to soft delete user. Please try again.');
              }
            });
          }
        });
      } else {
        // Hard delete
        this.alertService.confirm(
          `⚠️ WARNING: Are you absolutely sure you want to PERMANENTLY DELETE user ${user.name}?\n\nThis action cannot be undone and will permanently remove all user data!`,
          'Confirm Hard Delete'
        ).then((confirmed) => {
          if (confirmed) {
            this.hardDeleteUser(user);
          }
        });
      }
    });
  }

  hardDeleteUser(user: any) {
    console.log('Hard deleting user:', user);
    this.alertService.confirm(
      `⚠️ WARNING: Are you absolutely sure you want to PERMANENTLY DELETE user ${user.name}?\n\nThis action cannot be undone and will permanently remove all user data!`,
      'Confirm Permanent Delete'
    ).then((confirmed) => {
      if (confirmed) {
        this.userService.hardDeleteUser(user.id).subscribe({
          next: (response: any) => {
            console.log('User hard deleted response:', response);
            console.log('Response type:', typeof response);
            console.log('Response keys:', Object.keys(response));
            console.log('Response success:', response.success);
            console.log('Response message:', response.message);
            
            if (response && response.success) {
              console.log('User hard deleted successfully');
              this.loadUsers(); // Reload to update stats
              this.alertService.success('User has been permanently deleted!');
            } else {
              console.error('Failed to hard delete user:', response.message || response.error || 'Unknown error');
              this.alertService.error('Failed to hard delete user: ' + (response.message || response.error || 'Unknown error'));
            }
          },
          error: (err: any) => {
            console.error('Error hard deleting user:', err);
            console.error('Error object:', err);
            console.error('Error error property:', err.error);
            console.error('Error status:', err.status);
            console.error('Error statusText:', err.statusText);
            
            let errorMessage = 'Failed to hard delete user. Please try again.';
            
            // Handle specific error messages
            if (err.error && err.error.message) {
              errorMessage = err.error.message;
            } else if (err.error && err.error.error) {
              errorMessage = err.error.error;
            } else if (err.message) {
              errorMessage = err.message;
            }
            
            this.alertService.error('Error: ' + errorMessage);
          }
        });
      }
    });
  }

  restoreUser(user: any) {
    console.log('Restoring user:', user);
    this.alertService.confirm(
      `Are you sure you want to restore user ${user.name}? This will reactivate their account.`,
      'Confirm Restore'
    ).then((confirmed) => {
      if (confirmed) {
        this.userService.restoreUser(user.id).subscribe({
          next: (response: any) => {
            console.log('User restored response:', response);
            if (response.success) {
              console.log('User restored successfully');
              this.loadUsers(); // Reload to update stats
              this.alertService.success('User has been restored successfully!');
            } else {
              console.error('Failed to restore user:', response.message);
              this.alertService.error('Failed to restore user: ' + response.message);
            }
          },
          error: (err: any) => {
            console.error('Error restoring user:', err);
            this.alertService.error('Failed to restore user. Please try again.');
          }
        });
      }
    });
  }

  toggleShowDeletedUsers() {
    this.showDeletedUsers = !this.showDeletedUsers;
    console.log('Show deleted users:', this.showDeletedUsers);
    this.loadUsers(); // Reload with new setting
  }
}
