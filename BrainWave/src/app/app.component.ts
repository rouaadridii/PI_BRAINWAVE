import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'BRAINWAVE';
  isProfilePage = false;
  isAuthPage = false;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      /*if (event instanceof NavigationEnd) {
        this.isProfilePage = this.router.url.includes('/profile'); 
      }*/
      if (event instanceof NavigationEnd) {
        const currentUrl = this.router.url;
        this.isAuthPage = currentUrl.includes('/login') || currentUrl.includes('/signup') || currentUrl.includes('/profile'); // Exclude navbar on login and signup pages
      }
    });
  }
}
