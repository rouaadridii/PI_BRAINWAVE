import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, tap, catchError } from 'rxjs';
import { Article } from './models/article';

@Injectable({
  providedIn: 'root'
})
export class ArticleServiceService {
  private apiUrl = 'http://localhost:8085/articles';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  getAllArticles(): Observable<Article[]> {
    const url = `${this.apiUrl}`;
    console.log('Fetching articles from:', url);
    
    return this.http.get<Article[]>(url).pipe(
      tap({
        next: (articles) => {
          console.log('Raw response:', articles);
          if (!articles || articles.length === 0) {
            console.warn('No articles received from server');
          } else {
            console.log(`Received ${articles.length} articles`);
          }
        },
        error: (error) => {
          console.error('Error fetching articles:', error);
        }
      })
    );
  }

  getArticleById(id: number): Observable<Article> {
    console.log('Fetching article with id:', id);
    return this.http.get<Article>(`${this.apiUrl}/getArticleWithRessources/${id}`).pipe(
      tap(response => {
        console.log('Raw API response:', response);
        if (response && !response.ressources) {
          response.ressources = [];
        }
      })
    );
  }

  createArticle(article: Article): Observable<Article> {
    const url = `${this.apiUrl}/ajouter`;
    
    // Format and validate resources
    const formattedResources = (article.ressources || []).map(resource => ({
      description: (resource.description || '').substring(0, 255), // Limit to 255 chars
      video: (resource.video || '').substring(0, 255),
      pdf: (resource.pdf || '').substring(0, 255), 
      picture: (resource.picture || '').substring(0, 255),
      article: null
    }));

    const articleToCreate = {
      title: article.title.substring(0, 100), // Limit title length
      date: article.date instanceof Date ? article.date.toISOString().split('T')[0] : article.date,
      picture: (article.picture || '').substring(0, 255),
      status: article.status,
      views: article.views || 0,
      numberShares: article.numberShares || 0,
      categorie: article.categorie,
      user: { id: 1 },
      ressources: formattedResources
    };

    console.log('Sending article with resources:', JSON.stringify(articleToCreate, null, 2));

    return this.http.post<Article>(`${url}?id=1`, articleToCreate, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      tap(response => console.log('Server response with resources:', response)),
      catchError(error => {
        console.error('Server error details:', error);
        // Add more error details
        if (error.error && error.error.message) {
          console.error('Server message:', error.error.message);
        }
        throw error;
      })
    );
  }

  // Fonction utilitaire pour valider les URLs
  private validateUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    try {
      new URL(url);
      // Vérifier si l'URL commence par http:// ou https://
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  }

  updateArticle(id: number, article: Article): Observable<Article> {
    const url = `${this.apiUrl}/modifier/${id}`;
    
    const articleToUpdate = {
      ...article,
      date: article.date instanceof Date ? article.date.toISOString().split('T')[0] : article.date,
      user: { id: article.user?.id || 1 },
      ressources: article.ressources || []
    };

    console.log('Sending update request with data:', articleToUpdate);

    return this.http.put<Article>(url, articleToUpdate, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      tap(response => console.log('Update response:', response))
    );
  }

  deleteArticle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}