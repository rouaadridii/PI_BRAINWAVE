import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Quiz } from '../models/quiz'; 

interface QuizGenerationData {
  quizTitle: string;
  theme: string;
  multipleChoiceCount: number;
  dragAndDropCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class QuizAIService {
  private apiUrl = 'http://localhost:8087/quiz/api/quiz/ai'; // Utilisez l'URL de votre contrôleur AI

  constructor(private http: HttpClient) {}

  generateQuizFromJson(data: QuizGenerationData): Observable<Quiz> {
    return this.http.post<Quiz>(`${this.apiUrl}/generate-from-json`, data);
  }
}