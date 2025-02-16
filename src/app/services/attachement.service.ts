import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AttachementService {

  private apiUrl = 'http://localhost:8087/cours/attachements';

  constructor(private http: HttpClient) {}

  addAttachment(idCourse: number, formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/${idCourse}/add`, formData);
  }

  getAttachmentsByCourse(idCourse: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${idCourse}`);
  }

}
