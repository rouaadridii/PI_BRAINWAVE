import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';  // Assurez-vous que c'est bien Router et NavigationEnd
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'BRAINWAVE';
  isBackOfficePage = false; // Nouvelle variable

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const currentUrl = this.router.url;
        this.isBackOfficePage = currentUrl.includes('/back-office'); // Vérifiez si l'URL contient '/back-office'
      }
    });
  }
}
