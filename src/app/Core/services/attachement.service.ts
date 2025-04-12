import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Attachment } from '../Model/Attachment'; // Assurez-vous que le chemin est correct

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  // Attention: Cette URL base ('/cours/attachments') peut ne pas correspondre
  // à votre @RequestMapping("/attachments") dans le Controller Spring Boot.
  // Assurez-vous que l'URL est correcte.
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

    // Note: Le backend retourne peut-être un JSON, 'text' pourrait causer des erreurs si non géré.
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
     // Note: Le backend retourne peut-être { message: string }. Attendre 'string' peut causer des erreurs.
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

  // 🔹 Obtenir l'URL d'un attachment par nom (vérifier l'endpoint backend correspondant)
  getAttachment(fileName: string): string {
     // L'endpoint backend pour visualiser est '/attachments/{filename}'
     // L'endpoint pour télécharger est '/download/{id}'
     // Cette méthode ne correspond peut-être pas exactement.
    return `${this.baseUrl}/attachment/${fileName}`; // Cette URL pourrait ne pas fonctionner.
  }

  // 🔹 Valider un attachment
  validateAttachment(attachmentId: number): Observable<{ message: string }> {
    // Appel à PUT /cours/attachments/{id}/validate (vérifier si c'est le bon endpoint)
    return this.http.put<{ message: string }>(`${this.baseUrl}/${attachmentId}/validate`, {});
  }

  // *** NOUVEAU: Invalider un attachment ***
  /**
   * Appelle le backend pour marquer un attachment comme non validé (invalider).
   * @param attachmentId L'ID de l'attachment à invalider.
   * @returns Observable avec un message de succès/erreur.
   */
  invalidateAttachment(attachmentId: number): Observable<{ message: string }> {
    console.log(`Appel API pour invalider attachment ID: ${attachmentId}`);
    // Appel à PUT /cours/attachments/{id}/invalidate (vérifier si c'est le bon endpoint/baseUrl)
    return this.http.put<{ message: string }>(`${this.baseUrl}/${attachmentId}/invalidate`, {}).pipe(
      catchError(error => {
          console.error(`Erreur lors de l'invalidation de l'attachment ${attachmentId}:`, error);
          // Vous pouvez personnaliser le message d'erreur retourné au composant
          return throwError(() => new Error("Échec de l'invalidation de l'attachment"));
      })
    );
  }
  // *** FIN NOUVEAU ***


  // 🔹 Récupérer le score du cours
  getCourseScore(courseId: number): Observable<number> {
    // Appel à GET /cours/attachments/course/{courseId}/score (vérifier si c'est le bon endpoint)
    return this.http.get<number>(`${this.baseUrl}/course/${courseId}/score`);
  }

  // 🔹 Mettre à jour le temps passé sur un attachment
  updateTimeSpent(attachmentId: number, timeSpent: number): Observable<string> {
    const params = new HttpParams().set('timeSpent', timeSpent.toString());
    // Note: Le backend retourne peut-être { message: string }. Attendre 'string' peut causer des erreurs.
    return this.http.put<string>(`${this.baseUrl}/${attachmentId}/timeSpent`, {}, { params: params, responseType: 'text' as 'json' });
  }

  // 🔹 Récupérer le temps total passé sur les attachments d'un cours
  getTimeSpentOnCourse(courseId: number): Observable<number> {
     // Appel à GET /cours/attachments/course/{courseId}/timeSpent (vérifier si c'est le bon endpoint)
    return this.http.get<number>(`${this.baseUrl}/course/${courseId}/timeSpent`);
  }

} // Fin de la classe AttachmentService