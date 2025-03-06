import { Component, HostListener, AfterViewInit } from '@angular/core';
import { Course } from 'src/app/Core/Model/Course';
import { CoursesService } from 'src/app/Core/services/courses.service';
import { Router } from '@angular/router'; // Importez Router

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  courses: Course[] = [];
  carouselWidth: number = 0;

  constructor(private courseService: CoursesService, private router: Router) { } // Injectez Router

  ngOnInit(): void {
    this.getCourses();
  }

  getCourses() {
    this.courseService.getCourses().subscribe(data => {
      this.courses = data.map(course => ({
        ...course,
        rating: course.reviews ? course.reviews.length : 0  // Détermine le nombre d'étoiles
      }));
      setTimeout(() => {
        this.initOwlCarousel();
      }, 100);
    });
  }

  //Nouvelle méthode pour la note moyenne :
    calculateAverageRating(course: Course): number {
    if (!course.reviews || course.reviews.length === 0) {
      return 0; // Pas d'avis, note de 0
    }
        const totalRating = course.reviews.reduce((sum, review) => sum + review.rating, 0); // additionne tous review.rating
    return totalRating / course.reviews.length; //fait la moyenne
  }
    // Redirection vers la page de détails
  navigateToCourseDetails(courseId: number) {
    this.router.navigate(['/details', courseId]);
  }

  initOwlCarousel() {
    // Enlevez ce bloc, car vous n'utilisez pas Owl Carousel dans cette option
  }


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

  scrollLeft() {
      const carousel = document.querySelector('.course-carousel') as HTMLElement;
      const scrollAmount = 300; // Valeur fixe de défilement
        const currentTransform = parseInt(carousel.style.transform.replace('translateX(', '').replace('px)', '') || '0');
        const newTransform = Math.min(currentTransform + scrollAmount, 0); // Limite le défilement à gauche à 0
        carousel.style.transform = `translateX(${newTransform}px)`;

  }

    scrollRight() {
        const carousel = document.querySelector('.course-carousel') as HTMLElement;
        const cardWidth = document.querySelector('.course-item')?.clientWidth || 300;  // Largeur d'une carte, valeur par défaut si non trouvé
        const scrollAmount = 300; // Valeur fixe
        const maxScroll = (this.courses.length * (cardWidth + 30)) - carousel.clientWidth; // Calcul du défilement maximal (30 est la marge)

        const currentTransform = parseInt(carousel.style.transform.replace('translateX(', '').replace('px)', '') || '0');
		const newTransform = Math.max(currentTransform - scrollAmount, -maxScroll);
        carousel.style.transform = `translateX(${newTransform}px)`;
    }

  ngAfterViewInit() {
      // Retirer le code Owl Carousel si pas utiliser
  }
}