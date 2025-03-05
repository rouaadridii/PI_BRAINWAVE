import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrlogin = 'http://localhost:8080/api/authentification';
  private apiUrlprofile = 'http://localhost:8080/api/user';
  private apiUrlsignup='http://localhost:8080/api/auth/signup';
  private apiUrl='http://localhost:8080/api/auth';
  private apiurladmin='http://localhost:8080/api/admin';

  constructor(private http: HttpClient,private router: Router) { }
  
  //**********USER PROFILE INFO********/
  getUserInfo() {
    let token = localStorage.getItem('jwt');
    
    // Ensure "Bearer" is not duplicated
    if (token?.startsWith('Bearer ')) {
      token = token.replace('Bearer ', '');
    }
  
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrlprofile}/profile`, { headers });
  }


  updateUserProfile(updateRequest: any): Observable<any> {
    let token = localStorage.getItem('jwt');

    // Ensure "Bearer" is not duplicated
    if (token?.startsWith('Bearer ')) {
      token = token.replace('Bearer ', '');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrlprofile}/update-profile`, updateRequest, { headers });
  }


  //**************User Methods***********/
  login(email: string, password: string, recaptchaToken: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrlogin}/login`, { email, password, recaptchaToken }).pipe(
      tap(response => console.log("Backend response:", response)) // Debugging
    );
  }

  logout() {
    localStorage.removeItem('jwt');
    this.router.navigate(['/login']);
  }

  signup(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrlsignup, formData);
  }

  sendForgotPasswordEmail(email: string): Observable<any> {
    return this.http.post(`${this.apiUrlogin}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrlogin}/reset-password/${token}`, { newPassword });
  }

  verifyToken(token:string): Observable<any>{
    return this.http.post(`${this.apiUrlogin}/verify-token/${token}`, {});
  }

  //********PARTIE ADMIN*********/
  getusers(): Observable<any[]> {
    let token = localStorage.getItem('jwt');  // Directly get the token from localStorage
    // Ensure "Bearer" is not duplicated
    if (token?.startsWith('Bearer ')) {
      token = token.replace('Bearer ', '');
    }
  
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>(`${this.apiurladmin}/users`, { headers });
  }
  
  getpendingTeachers():Observable<any[]>{
    return this.http.get<any[]>(`${this.apiurladmin}/pending-teachers`);
  }

  approveTeacher(cin: string): Observable<any> {
    let token = localStorage.getItem('jwt');
    if (token && token.startsWith('Bearer ')) { // Added null check for token
      token = token.replace('Bearer ', '');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiurladmin}/approve-teacher/${cin}`, {}, { headers: headers }); // Corrected line
  }

  rejectTeacher(cin: string): Observable<any> {
    let token = localStorage.getItem('jwt');
    if (token && token.startsWith('Bearer ')) {
      token = token.replace('Bearer ', '');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiurladmin}/reject-teacher/${cin}`, { headers: headers });
  }

  banUser(email: string): Observable<any> {
  let token = localStorage.getItem('jwt');
  if (token && token.startsWith('Bearer ')) {
    token = token.replace('Bearer ', '');
  }

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.put(`${this.apiurladmin}/ban/${email}`, {}, { headers });
}
  unbanUser(email: string): Observable<any> {
  let token = localStorage.getItem('jwt');
  if (token && token.startsWith('Bearer ')) {
    token = token.replace('Bearer ', '');
  }

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.put(`${this.apiurladmin}/unban/${email}`, {}, { headers });
}


  //*********PARTIE VERIF EMAIL**********/
  sendVerificationEmail(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/send-verification-email`, {email: email });
  }

  verifyEmail(email: string, code: string): Observable<any> {
    console.log('Sending verify email request:', { email, code }); // Debugging
    return this.http.post(`${this.apiUrl}/verify-email`, { email, code });
  }
}
