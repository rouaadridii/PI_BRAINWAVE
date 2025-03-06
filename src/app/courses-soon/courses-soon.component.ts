import { Component } from '@angular/core';
import { Course } from '../Core/Model/Course';
import { CoursesService } from '../Core/services/courses.service';

@Component({
  selector: 'app-courses-soon',
  templateUrl: './courses-soon.component.html',
  styleUrls: ['./courses-soon.component.scss']
})
export class CoursesSoonComponent {
  courses: Course[] = [];
  filteredCourses: any[] = []; // Cours filtrés en fonction de la recherche


  constructor(private coursesService: CoursesService) {}
  ngOnInit(): void {
    // Récupérer les cours non publiés
    this.coursesService.getCoursesSoon().subscribe(
      (courses: Course[]) => {
        this.courses = courses;
      },
      (error) => {
        console.error('Erreur lors de la récupération des cours à venir', error);
      }
    );
  }
  loadCourses() {
    this.coursesService.getCourses().subscribe(courses => {
      this.courses = courses.filter(course => course.published); // Affiche uniquement les cours publiés
      this.filteredCourses = this.courses; // Initialise les cours filtrés
    });
  }

  addToFavorites(courseId: number): void {
    this.coursesService.addToFavorites(courseId).subscribe(
      (course: Course) => {
        console.log('Cours ajouté aux favoris:', course);
        // Mettez à jour la liste des cours après l'ajout
        this.loadCourses();
      },
      (error) => {
        console.error('Erreur lors de l\'ajout aux favoris:', error);
      }
    );
  }
}
