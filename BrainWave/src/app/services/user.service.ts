import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrlogin = 'http://localhost:8080/api/authentification/login';
  private apiUrlprofile = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(this.apiUrlogin, { email, password });
  }
  getUserProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrlprofile}/profile`);
  }
}
