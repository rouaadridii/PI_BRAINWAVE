import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-front-header',
  templateUrl: './front-header.component.html',
  styleUrls: ['./front-header.component.scss']
})
export class FrontHeaderComponent {
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const header = document.querySelector('.header-area');
    if (header) {
      if (window.scrollY > 50) { // Change à 50px de scroll
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  }
}
