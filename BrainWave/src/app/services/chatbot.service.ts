import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article } from '../models/article';
import { Tag } from '../models/tag';

export interface ChatbotResponse {
  type: string;
  message: string;
  articles?: Article[];
  tags?: Tag[];
  content_improvements?: string;
  similar_articles?: Article[];
  readability?: string;
  improvement_suggestions?: string;
  suggested_tags?: string[];
}

export interface ApiLimitInfo {
  dailyLimit: number;
  remainingCalls: number;
  isLimited: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = 'http://localhost:8085/articles'; // Adjust based on your backend URL

  constructor(private http: HttpClient) { }

  // Send a message to the chatbot
  sendMessage(message: string, userId: number, context: string = 'general'): Observable<ChatbotResponse> {
    return this.http.post<ChatbotResponse>(`${this.apiUrl}/chatbot`, {
      message,
      userId: userId.toString(),
      context
    });
  }

  // Get suggestions for an article being written
  getSuggestions(title: string, content: string, category: string): Observable<ChatbotResponse> {
    return this.http.post<ChatbotResponse>(`${this.apiUrl}/chatbot/suggestion`, {
      title,
      content,
      category
    });
  }

  // Analyze an existing article
  analyzeArticle(articleId: number): Observable<ChatbotResponse> {
    return this.http.post<ChatbotResponse>(`${this.apiUrl}/chatbot/analyze?articleId=${articleId}`, {});
  }
  
  // Get API limit information
  getChatbotLimit(): Observable<ApiLimitInfo> {
    return this.http.get<ApiLimitInfo>(`${this.apiUrl}/chatbot/limit`);
  }
}
