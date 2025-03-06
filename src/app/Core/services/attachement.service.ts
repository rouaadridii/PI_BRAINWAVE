import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Attachment } from '../Model/Attachment';

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  private baseUrl = 'http://localhost:8087/cours/attachments';

  constructor(private http: HttpClient) {}

  // 🔹 Récupérer tous les attachments d'un cours
  getAttachmentsByCourse(courseId: number): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`${this.baseUrl}/course/${courseId}`);
  }

  // 🔹 Ajouter un attachment
  addAttachment(courseId: number, file: File, chapterTitle: string): Observable<any> {
    const formData = new FormData();
    formData.append('courseId', courseId.toString());
    formData.append('file', file);
    formData.append('chapterTitle', chapterTitle);

    return this.http.post(`${this.baseUrl}/upload`, formData, { responseType: 'text' }).pipe(
        catchError(error => {
            console.error('Erreur upload:', error);
            return throwError(() => new Error('Échec de l’upload'));
        })
    );
}

  // 🔹 Supprimer un attachment
  deleteAttachment(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
}

  // 🔹 Modifier la visibilité d’un attachment
  updateVisibility(id: number, visible: boolean): Observable<string> {
    return this.http.put<string>(`${this.baseUrl}/${id}/visibility?visible=${visible}`, {});
  }

  // 🔹 Modifier un attachment
  updateAttachment(id: number, file: File | null, chapterTitle: string, visible: boolean): Observable<{ message: string }> {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    formData.append('chapterTitle', chapterTitle);
    formData.append('visible', visible.toString());
  
    return this.http.put<{ message: string }>(`${this.baseUrl}/${id}`, formData);
  }
  getAttachment(fileName: string): string {
    return `${this.baseUrl}/attachment/${fileName}`;
  }
  validateAttachment(attachmentId: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/${attachmentId}/validate`, {});
}

getCourseScore(courseId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/course/${courseId}/score`);
}
}
