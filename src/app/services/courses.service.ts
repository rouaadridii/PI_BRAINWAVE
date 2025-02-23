import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Course } from '../components/course';


@Injectable({
  providedIn: 'root'
})
export class CoursesService {

  private baseUrl = 'http://localhost:8087/cours/courses';
  private baseUrla = 'http://localhost:8087/cours/courses/addcours';
  private baseUrlb = 'http://localhost:8087/cours/courses/delete';
  private baseUrls = 'http://localhost:8087/cours/courses/statistics';
  private baseUrlm = 'http://localhost:8087/cours/courses/update-cours/';
  private baseUrln = 'http://localhost:8087/cours/reviews/courses';

  



  constructor(private http: HttpClient) { }

  // Ajouter un cours
  createCourse(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/addcours`, formData);
  }
  getCourseStatisticsByCategory(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.baseUrl}/statistics`);
  }


  // Récupérer tous les cours
  getAllCourses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/getcourse`);
  }
  /*updateCourse(idCourse: number, courseData: any, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('title', courseData.title);
    formData.append('description', courseData.description);
    formData.append('date', courseData.date);
    formData.append('level', courseData.level);
    formData.append('status', courseData.status);
    formData.append('price', courseData.price);
    formData.append('liked', courseData.liked);
    formData.append('categorie', courseData.categorie);
  
    if (file) {
      formData.append('file', file);
    }
  
    return this.http.put(`http://localhost:8087/cours/courses/update-cours/${idCourse}`, formData);
  }*/



    /*updateCourse(idCourse: number, coursData: Course, file?: File): Observable<Course> {
      const formData: FormData = new FormData();
  
      // Ajouter les données du cours au FormData
      formData.append('title', coursData.title);
      formData.append('description', coursData.description);
      formData.append('date', coursData.date ? coursData.date.toString() : ''); // Convertir Date en string ISO
      formData.append('level', coursData.level);
      formData.append('status', String(coursData.status)); // Convertir boolean en string
      formData.append('price', String(coursData.price)); // Convertir number en string
      formData.append('liked', String(coursData.liked)); // Convertir boolean en string
      formData.append('categorie', coursData.categorie); // Assurez-vous que categorie est un string ou compatible
  
      // Ajouter le fichier image si présent
      if (file) {
        formData.append('file', file, file.name);
      }
  
      // Effectuer la requête PUT vers votre endpoint d'update
      return this.http.put<Course>(`${this.baseUrl}/update-cours/${idCourse}`, formData);
    }*/

      updateCourse(idCourse: any, coursData: any): Observable<Course> {
        return this.http.put<Course>(`${this.baseUrl}/update-cours/${idCourse}`, coursData); // Correct string interpolation with backticks and ${}
    }
  getCourseById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.baseUrl}/${id}`);
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


  addReview(idCourse: number, rating: number): Observable<any> {
    return this.http.post(`http://localhost:8087/cours/reviews/courses/${idCourse}`, {
      rating: rating,
      
    });
    
    

}
getCourseRating(idCourse: number): Observable<number> {
  return this.http.get<number>(`http://localhost:8087/cours/reviews/courses/${idCourse}/rating`);
}

updateCourseLikedStatus(idCourse: number, liked: boolean): Observable<any> {
  return this.http.put(`${this.baseUrl}/${idCourse}/like`, {}, { params: { liked: liked.toString() } });
}
updateCourseStatus(idCourse: number, newStatus: boolean): Observable<any> {
  // ✅ Endpoint PUT corrigé pour correspondre à l'URL backend: /courses/{idCourse}/status
  return this.http.put(`${this.baseUrl}/${idCourse}/status`, newStatus); // ✅ Envoi de newStatus directement dans le corps JSON
  // ou, si votre backend attend une structure JSON spécifique pour le statut :
  // return this.http.put(`${this.apiUrl}/${idCourse}/status`, { status: newStatus }); // Envoi de { status: newStatus } dans le corps JSON
}

getAverageRating(idCourse: number): Observable<number> {
      return this.http.get<number>(`${this.baseUrln}/courses/${idCourse}/average`);
    }



  addCourseWithoutAttachment(courseData: FormData): Observable<any> { // Pour la création du cours SANS pièces jointes
    return this.http.post(`${this.baseUrl}/addcours`, courseData);
}

addAttachmentToCourse(idCourse: number, attachmentData: FormData): Observable<any> { // Pour ajouter les pièces jointes APRES
    return this.http.post(`http://localhost:8087/cours/attachements/${idCourse}/add`, attachmentData); // Endpoint pour les pièces jointes
}

addCourse(courseData: FormData): Observable<Course> {
  return this.http.post<Course>(`${this.baseUrl}/addcours`, courseData);
}

}
