import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private baseUrl = 'http://localhost:8087/cours/reviews'; // Base URL
  private baseUrlb ='http://localhost:8087/cours/reviews/ajouter;'

  constructor(private http: HttpClient) {}

  // Obtenir les avis d'un cours
  getReviewsByCourse(courseId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/course/${courseId}`);
  }

  // Ajouter un avis
  addReview(review: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ajouter`, review);
  }

  // Supprimer un avis
  deleteReview(reviewId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${reviewId}`);
  }
}
