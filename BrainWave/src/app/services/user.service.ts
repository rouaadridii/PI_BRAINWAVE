import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrlogin = 'http://localhost:8080/api/authentification/login';
  private apiUrlprofile = 'http://localhost:8080/api/user/profile';
  private apiUrlsignup='http://localhost:8080/api/auth/signup';

  constructor(private http: HttpClient,private router: Router) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(this.apiUrlogin, { email, password });
  }   
  // Get user info with Authorization header
  getUserInfo() {
    let token = localStorage.getItem('jwt');
    
    // Ensure "Bearer" is not duplicated
    if (token?.startsWith('Bearer ')) {
      token = token.replace('Bearer ', '');
    }
  
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(this.apiUrlprofile, { headers });
  }

  // Logout method
  logout() {
    // Remove the JWT token from localStorage
    localStorage.removeItem('jwtToken');

    // Optionally, redirect to login page
    this.router.navigate(['/login']);
  }

  signup(formData: FormData): Observable<any> {
    return this.http.post(this.apiUrlsignup, formData);
  }
  
}
