import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Course } from '../Model/Course';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {


private baseUrl = 'http://localhost:8087/cours/courses'; // Assure-toi que ton backend tourne sur ce port

constructor(private http: HttpClient) {}

// Récupérer tous les cours
getCourses(): Observable<Course[]> {
  return this.http.get<Course[]>(this.baseUrl);
}
getFileUrl(filename: string): string {
  return `http://localhost:8087/cours/attachments/attachments/${filename}`;
}

getCourseStatistics(): Observable<any> {
  return this.http.get<any>(`${this.baseUrl}/statistics`);
}
// Récupérer un cours par ID
getCourseById(id: number): Observable<Course> {
  return this.http.get<Course>(`${this.baseUrl}/${id}`);
}

addCourse(courseData: FormData): Observable<Course> {
  return this.http.post<Course>(`${this.baseUrl}/add`, courseData);
}

  //Méthode pour ajouter un cours avec une publication programmée s7i7a
 scheduleCoursePublication(courseData: any): Observable<any> {
  const headers = new HttpHeaders();
  const formData = new FormData();

  // Ajout des données du cours à FormData
  for (const key in courseData) {
    if (courseData.hasOwnProperty(key)) {
      formData.append(key, courseData[key]);
    }
  }

  return this.http.post(`${this.baseUrl}/createWithScheduledPublish`, formData, { headers });
}




getCoursesSoon(): Observable<Course[]> {
  return this.http.get<Course[]>(`${this.baseUrl}/soon`);  // L'URL de l'API pour récupérer les cours non publiés
}
updateCourse(courseId: number, updatedCourse: any, file?: File): Observable<any> {
  const formData = new FormData();
  
  // Vérification que la catégorie est définie
  if (!updatedCourse.category || updatedCourse.category.trim() === '') {
    return throwError(() => new Error('La catégorie doit être spécifiée.'));
  }

  formData.append('title', updatedCourse.title);
  formData.append('level', updatedCourse.level);
  formData.append('description', updatedCourse.description);
  formData.append('category', updatedCourse.category);
  formData.append('price', updatedCourse.price);
  formData.append('status', updatedCourse.status);
  
  if (updatedCourse.date) {
    formData.append('date', updatedCourse.date);
  }
  
  if (file) {
    formData.append('file', file);
  }

  return this.http.put(`${this.baseUrl}/update/${courseId}`, formData).pipe(
    catchError(error => {
      console.error('Erreur lors de la mise à jour du cours:', error);
      return throwError(() => error);
    })
  );
}
addToFavorites(courseId: number): Observable<Course> {
  return this.http.post<Course>(`${this.baseUrl}/courses/${courseId}/favorite`, {});
}

// Méthode pour retirer un cours des favoris
removeFromFavorites(courseId: number): Observable<Course> {
  return this.http.post<Course>(`${this.baseUrl}/${courseId}/remove-favorite`, {});
}

getPublishedCourses(): Observable<Course[]> {
  return this.http.get<Course[]>(`${this.baseUrl}`).pipe(
    map(courses => courses.filter(course => course.published)) // Filtrer les cours publiés
  );
}




// Supprimer un cours
deleteCourse(id: number): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
}
deleteCoursen(id: number): Observable<string> { // Change return type to Observable<string>
  return this.http.delete(`${this.baseUrl}/delete/${id}`, { responseType: 'text' }); // Tell HttpClient to expect text
}

// Récupérer une image
getImage(fileName: string): string {
  return `${this.baseUrl}/images/${fileName}`;
}

getCourseRating(idCourse: number): Observable<number> {
  return this.http.get<number>(`http://localhost:8087/cours/reviews/courses/${idCourse}/rating`);
}

getTotalCourses(): Observable<number> {
  return this.http.get<number>(`${this.baseUrl}/count`);
}


getFavoriteCourses(): Observable<number> {
  return this.http.get<number>(`${this.baseUrl}/favorites/count`);
}
// NOUVELLE méthode pour les statistiques par catégorie
getCategoryStatistics(): Observable<any> {
  // Utilise l'URL que vous avez fournie
  return this.http.get<any>(`${this.baseUrl}/statistics/category`);
}
updateCourseStatus(idCourse: number, newStatus: boolean): Observable<any> {
  const url = `${this.baseUrl}/${idCourse}/status`; // URL avec /status
  // Créer les paramètres de requête
  const params = new HttpParams().set('status', newStatus.toString());
  // Envoyer en PUT, sans corps (null), mais avec les paramètres
  return this.http.put(url, null, { params: params });
}

}