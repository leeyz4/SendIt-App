import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  user = JSON.parse(localStorage.getItem('currentUser') || '{}');
}
