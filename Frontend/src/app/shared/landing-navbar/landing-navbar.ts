import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './landing-navbar.html',
  styleUrls: ['./landing-navbar.css']
})
export class LandingNavbar {
  constructor(private router: Router) {}

  navigate(path: string) {
    this.router.navigate([path]);
  }
}
