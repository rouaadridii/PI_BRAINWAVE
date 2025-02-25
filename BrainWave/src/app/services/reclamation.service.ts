import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReclamationService {
  constructor(private http: HttpClient) {}


  private url="http://localhost:8089/claimManagementPI/recalamtions/addreclamation";
  private urlb="http://localhost:8089/claimManagementPI/recalamtions/list"
  private urlc= "http://localhost:8089/claimManagementPI/recalamtions"
  private urld= "http://localhost:8089/claimManagementPI/recalamtions"

  

  getReclamation(): Observable<any[]> {
    return this.http.get<any[]>(this.urlb); 
  }



 ajouterreclamation(reclamation:any):Observable <any>{


    return this.http.post(this.url,reclamation);
    
      }

      supprimerReclamation(id: number): Observable<any> {
        return this.http.delete(`${this.urlc}/${id}`);
      }

      modifierReclamation(reclamation: any): Observable<any> {
        return this.http.put(`${this.urld}/${reclamation.id}`, reclamation);
      }

}
