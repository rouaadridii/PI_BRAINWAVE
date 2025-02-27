import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentQuizService {

  private apiUrl = 'http://localhost:8087/quiz/api/quiz';

  constructor(private http: HttpClient) { }
 
  evaluateQuiz(quizId: number, cin: number, studentAnswers: { questionId: number, response: any }[]): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/evaluate/${quizId}/${cin}`, studentAnswers);
  }

  getQuizStatistics(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/statistics`);
  }

  getStudentByCin(cin: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/student/${cin}`);
  }

  // Création d'un paiement stripe
  /*createCheckoutSession(amount: number, currency: string) {
    return this.http.post(`${this.apiUrl}/create-checkout-session?amount=${amount}&currency=${currency}`, {}, { responseType: 'text' });
  }*/
 createCheckoutSession(amount: number, currency: string, quizId: number): Observable<string> {
    const params = new HttpParams()
      .set('amount', amount.toString())
      .set('currency', currency)
      .set('quizId', quizId.toString());

    return this.http.post(this.apiUrl + '/create-checkout-session', null, { params, responseType: 'text' });
  }

  // Création d'un paiement PayPal
  createPayPalPayment(amount: number): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/pay?amount=${amount}`, {}, { responseType: 'text' as 'json' });
  }

  // Validation du paiement PayPal
  executePayPalPayment(paymentId: string, payerId: string): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/success?paymentId=${paymentId}&PayerID=${payerId}`, { responseType: 'text' as 'json' });
  }
  
}