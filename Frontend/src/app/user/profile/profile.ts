import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserSidebar } from '../../shared/user-sidebar/user-sidebar';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, UserSidebar],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  user = JSON.parse(localStorage.getItem('currentUser') || '{}');
}
