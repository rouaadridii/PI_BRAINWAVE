import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subscription, interval, Subject } from 'rxjs';
import { switchMap, tap, filter } from 'rxjs/operators'; // Added missing filter import
import { ReadLater } from './models/read-later';
import { NotificationWebsocketService } from './services/notification-websocket.service';

@Injectable({
  providedIn: 'root'
})
export class ReadLaterService {
  private apiUrl = 'http://localhost:8085/readlater';
  private pollingSubscription: Subscription | null = null;
  private websocketSubscription: Subscription | null = null;
  private notificationsSubject = new Subject<ReadLater[]>();

  constructor(
    private http: HttpClient,
    private websocketService: NotificationWebsocketService
  ) {}

  addReadLater(userId: number, articleId: number, reminderDate: string): Observable<ReadLater> {
    // Add cache-busting parameters
    const timestamp = new Date().getTime();
    const uniqueId = Math.floor(Math.random() * 1000000);
    
    let params = new HttpParams()
      .set('userId', userId.toString())
      .set('articleId', articleId.toString())
      .set('reminderDate', reminderDate)
      .set('_t', timestamp.toString())
      .set('unique', uniqueId.toString());
    
    return this.http.post<ReadLater>(`${this.apiUrl}/add`, null, { params });
  }

  getReadLaterByUser(userId: number): Observable<ReadLater[]> {
    const timestamp = new Date().getTime();
    return this.http.get<ReadLater[]>(`${this.apiUrl}/user/${userId}?_t=${timestamp}`);
  }

  getReadLaterArticlesByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}/articles`);
  }
  
  removeReadLater(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/remove/${id}`);
  }
  
  removeReadLaterByUserAndArticle(userId: number, articleId: number): Observable<void> {
    let params = new HttpParams()
      .set('userId', userId.toString())
      .set('articleId', articleId.toString());
    
    return this.http.delete<void>(`${this.apiUrl}/remove`, { params });
  }

  checkPendingNotifications(userId: number): Observable<ReadLater[]> {
    const timestamp = new Date().getTime();
    return this.http.get<ReadLater[]>(`${this.apiUrl}/user/${userId}/pending?_t=${timestamp}`);
  }
  
  markNotificationAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/notification/${notificationId}/read`, null);
  }

  // Updated method to use WebSocket instead of polling
  startNotificationPolling(userId: number): Observable<ReadLater[]> {
    // Stop any existing polling or websocket connections
    this.stopNotificationPolling();
    
    // Subscribe to WebSocket notifications
    this.websocketSubscription = this.websocketService.connect(userId)
      .pipe(
        filter((msg: any) => msg?.type === 'readLaterNotification')
      )
      .subscribe({
        next: (notification) => {
          console.log('WebSocket notification received:', notification);
          // When we receive a notification, fetch the actual data
          this.checkPendingNotifications(userId).subscribe(
            data => this.notificationsSubject.next(data)
          );
        },
        error: (error) => {
          console.error('WebSocket error:', error);
          // Fallback to polling if WebSocket fails
          this.fallbackToPolling(userId);
        }
      });
    
    return this.notificationsSubject.asObservable();
  }

  private fallbackToPolling(userId: number): void {
    console.log('Falling back to polling for notifications');
    this.pollingSubscription = interval(30000).pipe(
      switchMap(() => this.checkPendingNotifications(userId))
    ).subscribe(
      data => this.notificationsSubject.next(data)
    );
  }

  stopNotificationPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
    
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
      this.websocketSubscription = null;
      this.websocketService.disconnect();
    }
  }

  // Get real-time notifications
  getWebSocketNotifications(): Observable<ReadLater[]> {
    return this.notificationsSubject.asObservable();
  }
}
