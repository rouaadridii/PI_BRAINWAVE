import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoursesService {

  private baseUrl = 'http://localhost:8087/cours/courses';
  private baseUrla = 'http://localhost:8087/cours/courses/addcours';
  private baseUrlb = 'http://localhost:8087/cours/courses/delete';



  constructor(private http: HttpClient) {}

  // Ajouter un cours
  createCourse(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/addcours`, formData);
  }

  // Récupérer tous les cours
  getAllCourses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/getcourse`);
  }
  updateCourse(id: number, course: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/update/${id}`, course);
  }
  
  

  // Récupérer les catégories de cours
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/categories`);
  }

  // 📌 🔥 **Méthode pour uploader une image**
  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.baseUrl}/upload-image`, formData);
  }

 // CoursService (même dans votre code)

// CoursService (méthode pour supprimer un cours)



deleteCourse(id: number): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/delete/${id}`, { responseType: 'text' as 'json' });
}

updateCourseWithImage(id: number, course: any, image?: File): Observable<any> {
  const formData = new FormData();
  formData.append('course', new Blob([JSON.stringify(course)], { type: 'application/json' }));
  if (image) {
    formData.append('image', image);
  }

  return this.http.put(`${this.baseUrl}/${id}/upload`, formData);
}
}
