import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';

  constructor(private router: Router) {}

  register() {
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    // Save user to localStorage
    const newUser = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password
    };
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    // Set current user
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    alert('Registration successful!');
    this.router.navigate(['/login']);
  }
}
