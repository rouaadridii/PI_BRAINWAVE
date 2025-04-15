import { Component, OnInit, OnDestroy } from '@angular/core';
import { Course } from '../Core/Model/Course';
import { CoursesService } from '../Core/services/courses.service';
import { Subscription, interval, startWith, switchMap } from 'rxjs'; // Importations nécessaires

@Component({
  selector: 'app-courses-soon',
  templateUrl: './courses-soon.component.html',
  styleUrls: ['./courses-soon.component.scss']
})
export class CoursesSoonComponent implements OnInit, OnDestroy { // Implémenter OnDestroy
  courses: Course[] = [];
  private timerSubscription: Subscription | null = null; // Pour gérer le polling

  constructor(private coursesService: CoursesService) {}

  ngOnInit(): void {
    // Polling toutes les 60 secondes pour rafraîchir la liste
    this.timerSubscription = interval(60000) // Toutes les 60000 ms = 1 minute
      .pipe(
        startWith(0), // Exécuter immédiatement au démarrage
        // Utiliser l'appel qui retourne les cours "à venir" ou TOUS les cours si le backend ne filtre pas "soon"
        // Option A: Si getCoursesSoon() retourne SEULEMENT les non-publiés (préférable)
        switchMap(() => this.coursesService.getCoursesSoon())
        // Option B: Si vous devez filtrer depuis la liste complète (moins efficace)
        // switchMap(() => this.coursesService.getCourses())
      )
      .subscribe(
        (fetchedCourses: Course[]) => {
          const now = new Date();
          // Filtrer pour ne garder que les cours avec une date future
          // (Si Option B ci-dessus, sinon getCoursesSoon le fait déjà)
           this.courses = fetchedCourses.filter(course =>
               course.scheduledPublishDate && new Date(course.scheduledPublishDate) > now
           );
           console.log('Courses Soon Updated:', this.courses); // Pour débug
        },
        (error) => {
          console.error('Erreur lors de la récupération des cours à venir', error);
        }
      );
  }

  ngOnDestroy(): void {
    // Très important : Se désabonner pour éviter les fuites mémoire
    this.timerSubscription?.unsubscribe();
  }

  // SUPPRIMER les méthodes loadCourses() et addToFavorites() de ce composant
  // car elles ne correspondent pas à la logique "Cours à venir".
}