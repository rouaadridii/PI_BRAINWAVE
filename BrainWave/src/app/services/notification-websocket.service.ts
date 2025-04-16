import { Injectable } from '@angular/core';
import { Observable, Subject, Observer, interval } from 'rxjs';
import { filter, map, takeWhile } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationWebsocketService {
  private socket: WebSocket | null = null;
  private messagesSubject = new Subject<any>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnecting = false;
  private alive = true;

  constructor() { }

  public connect(userId: number): Observable<any> {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('WebSocket is already connected');
      return this.messagesSubject.asObservable();
    }

    this.setupSocketConnection(userId);
    return this.messagesSubject.asObservable();
  }

  public disconnect(): void {
    this.alive = false;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    console.log('WebSocket disconnected');
  }

  public send(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  private setupSocketConnection(userId: number): void {
    const socketUrl = `ws://localhost:8085/ws/notifications?userId=${userId}`;
    
    this.socket = new WebSocket(socketUrl);
    
    this.socket.onopen = () => {
      console.log('WebSocket connection established');
      this.reconnectAttempts = 0;
      this.reconnecting = false;
    };
    
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.messagesSubject.next(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    this.socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
      if (this.alive && !this.reconnecting && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.attemptReconnect(userId);
      }
    };
  }

  private attemptReconnect(userId: number): void {
    this.reconnecting = true;
    this.reconnectAttempts++;
    
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      this.setupSocketConnection(userId);
    }, 3000); // Wait 3 seconds before reconnecting
  }

  // Get an observable that emits only readLaterNotification events
  public getReadLaterNotifications(): Observable<any> {
    return this.messagesSubject.asObservable().pipe(
      filter(msg => msg && msg.type === 'readLaterNotification'),
      map(msg => msg)
    );
  }
}
