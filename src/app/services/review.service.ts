import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private baseUrl = 'http://localhost:8087/cours/reviews'; // Base URL
  private baseUrlb ='http://localhost:8087/cours/reviews/ajouter;'
  private baseUrlr = 'http://localhost:8087/cours/courses/courses';


  constructor(private http: HttpClient) {}

  // Obtenir les avis d'un cours
  getReviewsByCourse(courseId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/course/${courseId}`);
  }
  getCourseRatingb(idCourse: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/courses/${idCourse}/rating`);
  }
  // Ajouter un avis
  
  addReviewR(idCourse: number, rating: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/courses/${idCourse}/reviews`, { rating });
  }
  

  // Supprimer un avis
  deleteReview(reviewId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${reviewId}`);
  }
  
  getAverageRating(idCourse: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/${idCourse}/averageRating`); // 🔑 Corrected Path: /{idCourse}/averageRating  (relative to apiUrl)
  }
  
  
  /**
       * Récupère la note donnée par l'utilisateur actuel pour un cours spécifique.
       * Note: Cette méthode pourrait nécessiter une authentification côté serveur pour fonctionner correctement.
       * @param idCourse L'ID du cours.
       * @returns Un Observable contenant la note de l'utilisateur pour le cours.
       */
    addReview(idCourse: number, rating: number): Observable<any> {
      return this.http.post(`http://localhost:8087/cours/reviews/courses/${idCourse}`, {
        rating: rating,
        
      });


    

}

getCourseRating(idCourse: number): Observable<number> {
      return this.http.get<number>(`${this.baseUrl}/courses/${idCourse}/rating`);
    }




  addCourseReview(idCourse: number, rating: number, comment?: string): Observable<any> {
        const body = { rating: rating, comment: comment };
        return this.http.post(`${this.baseUrl}/courses/${idCourse}/reviews`, body);
      }
    



    getallAverageRating(): Observable<Map<number, number>> {
      const url = `${this.baseUrlr}/average`;
      return this.http.get<Map<number, number>>(url);
    }



    addReviewjd(idCourse: number, rating: number, comment: string): Observable<any> {
      return this.http.post(`${this.baseUrl}/courses/${idCourse}/reviews`, {
        rating: rating,
        comment: comment
      });
      
}}
