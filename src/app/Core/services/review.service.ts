import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../Model/Review';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private baseUrl = 'http://localhost:8087/cours/reviews'; // Assurez-vous que votre backend tourne sur ce port
  private baseUrln = 'http://localhost:8087/cours/reviews/courses/{{idCourse}}'; // Assurez-vous que votre backend tourne sur ce port

  constructor(private http: HttpClient) {}

  // Ajouter un avis
  addReview(courseId: number, rating: number, comment: string): Observable<Review> {
    const review: Review = { rating, comment };
    return this.http.post<Review>(`${this.baseUrl}/add/${courseId}`, review);
  }
  addReviewm(idCourse: number, rating: number, comment: string): Observable<Review> {
    const review: Review = { rating, comment };
    return this.http.post<Review>(`http://localhost:8087/cours/reviews/courses/${idCourse}`, review);
  }
  addReviewn(idCourse: number, rating: number, comment: string): Observable<any> {
    const review: Review = { rating, comment };
    return this.http.post(`http://localhost:8087/cours/reviews/courses/${idCourse}`, review, { responseType: 'text' });
  }

  // Récupérer les avis d'un cours
  getReviewsByCourse(courseId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.baseUrl}/course/${courseId}`);
  }

  // Supprimer un avis
  deleteReview(reviewId: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/delete/${reviewId}`, { responseType: 'text' });
  }

  // Récupérer un avis par ID
  getReviewById(reviewId: number): Observable<Review> {
    return this.http.get<Review>(`${this.baseUrl}/get/${reviewId}`);
  }

  // Mettre à jour un avis
  updateReview(reviewId: number, updatedReview: Review): Observable<Review> {
    return this.http.put<Review>(`${this.baseUrl}/update/${reviewId}`, updatedReview);
  }

  // Récupérer la note moyenne d'un cours
  
  getAverageRating(idCourse: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/${idCourse}/averageRating`); // 🔑 Corrected Path: /{idCourse}/averageRating  (relative to apiUrl)
  }
  
}