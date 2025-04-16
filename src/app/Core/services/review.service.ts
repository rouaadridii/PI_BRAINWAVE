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
  
  addReviewp(courseId: number, rating: number, comment: string): Observable<Review> {
    // Crée un objet partiel contenant seulement les données nécessaires pour l'ajout
    // Note : On n'envoie pas idReview (généré par backend), ni les champs IA, ni l'objet Course complet.
    const reviewData: Partial<Review> = { rating, comment }; 
    
    // Envoie la requête POST à l'endpoint backend /reviews/add/{courseId}
    return this.http.post<Review>(`${this.baseUrl}/add/${courseId}`, reviewData);
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


  // --- NOUVELLE MÉTHODE : Récupérer tous les avis ---
  /**
   * Récupère la liste de tous les avis depuis le backend.
   * Attention: Retourne des entités Review complètes. Peut causer des problèmes
   * de performance ou de sérialisation si la liste est très grande ou les relations complexes.
   */
  getAllReviews(): Observable<Review[]> {
    // Appelle GET http://localhost:8087/cours/reviews
    return this.http.get<Review[]>(`${this.baseUrl}`); 
  }

  // --- NOUVELLE MÉTHODE : Récupérer les statistiques de sentiment ---
  /**
   * Récupère les statistiques agrégées sur les sentiments des avis.
   * Retourne un Observable d'une Map où la clé est le sentiment (string) 
   * et la valeur est le nombre d'avis (number).
   */
  getSentimentStatistics(): Observable<Map<string, number>> { 
    // Appelle GET http://localhost:8087/cours/reviews/statistics/sentiment
    // Le backend renvoie Map<String, Long>, Angular reçoit Map<string, number>
    return this.http.get<Map<string, number>>(`${this.baseUrl}/statistics/sentiment`);
  }
  
}