import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { StudentQuiz } from '../models/StudentQuiz';

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

  createCheckoutSession(amount: number, currency: string, quizId: number): Observable<string> {
    const params = new HttpParams()
      .set('amount', amount.toString())
      .set('currency', currency)
      .set('quizId', quizId.toString());

    return this.http.post(this.apiUrl + '/create-checkout-session', null, { params, responseType: 'text' });
  }

  updatePaymentStatus(studentCin: number, quizId: number): Observable<string> {
    const params = new HttpParams()
      .set('studentCin', studentCin.toString())
      .set('quizId', quizId.toString());

    return this.http.put(this.apiUrl + '/update-payment-status', null, { params, responseType: 'text' });
  }

  updateEmailStatus(studentCin: number, quizId: number): Observable<string> {
    const params = new HttpParams()
      .set('studentCin', studentCin.toString())
      .set('quizId', quizId.toString());

    return this.http.put(this.apiUrl + '/update-email-status', null, { params, responseType: 'text' });
  }

  sendEmail(to: string, subject: string, htmlContent: string): Observable<any> {
    return this.http.post(this.apiUrl + '/send-email', { to, subject, htmlContent }).pipe();
  }

  getStudentQuizByStudentAndQuiz(studentCin: number, quizId: number): Observable<StudentQuiz> {
      return this.http.get<StudentQuiz>(`${this.apiUrl}/StudentQuiz/${studentCin}/${quizId}`);
  }
  
}