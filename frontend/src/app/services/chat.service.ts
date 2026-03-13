import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:3000/api/chat';
  private socket: Socket | null = null;
  private messagesSubject = new Subject<any>();
  public messages$ = this.messagesSubject.asObservable();
  
  private typingSubject = new Subject<{userId: string, isTyping: boolean}>();
  public typing$ = this.typingSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeSocket();
  }

  private initializeSocket() {
    const token = localStorage.getItem('token');
    if (token && !this.socket) {
      this.socket = io('http://localhost:3000', {
        query: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      // Listen for incoming messages
      this.socket.on('message:received', (data: any) => {
        this.messagesSubject.next(data);
      });

      // Listen for typing indicators
      this.socket.on('user:typing', (data: any) => {
        this.typingSubject.next(data);
      });

      // Listen for user online status
      this.socket.on('user:online', (data: any) => {
        console.log(`User ${data.userId} is online`);
      });

      // Handle connection errors
      this.socket.on('connect_error', (error) => {
        console.error('Chat connection error:', error);
      });
    }
  }

  // Get chat history with a user or support agent
  getChatHistory(conversationId: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.get<any>(`${this.apiUrl}/history/${conversationId}`, {
      headers: { 'x-auth-token': token || '' }
    });
  }

  // Send a message through socket
  sendMessage(conversationId: string, message: string, attachments?: any[]): void {
    if (this.socket) {
      this.socket.emit('message:send', {
        conversationId,
        message,
        attachments,
        timestamp: new Date()
      });
    }
  }

  // Emit typing indicator
  setTyping(conversationId: string, isTyping: boolean): void {
    if (this.socket) {
      this.socket.emit('user:typing', {
        conversationId,
        isTyping
      });
    }
  }

  // Get all conversations for logged-in user
  getConversations(): Observable<any[]> {
    const token = localStorage.getItem('token');
    return this.http.get<any[]>(`${this.apiUrl}/conversations`, {
      headers: { 'x-auth-token': token || '' }
    });
  }

  // Start new conversation with support
  startSupportConversation(subject: string, message: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post<any>(`${this.apiUrl}/support/start`, { subject, message }, {
      headers: { 'x-auth-token': token || '' }
    });
  }

  // Get support agents for escalation
  getSupportAgents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/support/agents`);
  }

  // Rate a conversation/agent
  rateConversation(conversationId: string, rating: number, feedback: string): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.post<any>(`${this.apiUrl}/rate/${conversationId}`, { rating, feedback }, {
      headers: { 'x-auth-token': token || '' }
    });
  }

  // Disconnect socket on logout
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
