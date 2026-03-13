import { Component, OnInit, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed bottom-6 right-6 z-40 w-96 h-[600px] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
        <div>
          <h3 class="font-black text-lg">Support Chat</h3>
          <p class="text-[10px] text-blue-100 font-bold uppercase">Average response: 2 min</p>
        </div>
        <button (click)="isOpen = !isOpen" class="bg-blue-500/30 hover:bg-blue-500/50 p-2 rounded-lg transition-colors">
          {{ isOpen ? '−' : '+' }}
        </button>
      </div>

      <!-- Chat Body -->
      <div *ngIf="isOpen" class="flex-1 flex flex-col overflow-hidden">
        <!-- Messages Container -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" #messagesContainer>
          <!-- System Message -->
          <div class="text-center text-xs text-gray-400 font-bold uppercase">
            {{ conversations.length === 0 ? 'Start a conversation' : 'Chat History' }}
          </div>

          <!-- Messages -->
          <div *ngFor="let msg of messages" class="flex" [ngClass]="msg.senderRole === 'user' ? 'justify-end' : 'justify-start'">
            <div class="max-w-xs px-4 py-3 rounded-2xl" 
                 [ngClass]="msg.senderRole === 'user' 
                   ? 'bg-blue-600 text-white rounded-br-none' 
                   : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'">
              <p class="text-sm font-medium">{{ msg.message }}</p>
              <p class="text-[10px] mt-1" [ngClass]="msg.senderRole === 'user' ? 'text-blue-100' : 'text-gray-400'">
                {{ msg.createdAt | date:'short' }}
              </p>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div *ngIf="isTyping" class="flex justify-start">
            <div class="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-none">
              <div class="flex gap-1">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="border-t bg-white p-4 space-y-3">
          <!-- Subject Input (on first message) -->
          <div *ngIf="messages.length === 0">
            <input 
              [(ngModel)]="newSubject" 
              placeholder="Issue subject..." 
              class="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold">
          </div>

          <!-- Message Input -->
          <div class="flex gap-2">
            <input 
              [(ngModel)]="newMessage"
              (keyup.enter)="sendMessage()"
              (input)="onTyping()"
              placeholder="Type your message..."
              class="flex-1 p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
            <button 
              (click)="sendMessage()" 
              [disabled]="!newMessage"
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-3 rounded-xl font-black text-sm transition-colors">
              Send
            </button>
          </div>

          <!-- Support Agents (Optional) -->
          <div *ngIf="messages.length > 0" class="flex gap-2 text-[10px]">
            <span class="font-bold text-gray-500">Support team:</span>
            <div class="flex gap-1">
              <img *ngFor="let agent of supportAgents.slice(0, 3)" 
                   [src]="agent.avatar" 
                   [title]="agent.name"
                   class="w-5 h-5 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform cursor-help">
            </div>
          </div>
        </div>

        <!-- Rating Section (After Resolution) -->
        <div *ngIf="showRating" class="bg-yellow-50 border-t border-yellow-200 p-4">
          <p class="text-xs font-black text-yellow-800 mb-3">How was your experience?</p>
          <div class="flex gap-2 justify-center mb-3">
            <button *ngFor="let star of [1,2,3,4,5]" 
                    (click)="rateConversation(star)"
                    class="text-2xl hover:scale-125 transition-transform cursor-pointer">
              {{ star <= selectedRating ? '⭐' : '☆' }}
            </button>
          </div>
          <input 
            [(ngModel)]="ratingFeedback"
            placeholder="Optional feedback..."
            class="w-full p-2 rounded-lg border border-yellow-200 text-xs mb-2"
            maxlength="200">
          <button 
            (click)="submitRating()"
            class="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-2 rounded-lg font-bold text-xs">
            Submit Rating
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    ::-webkit-scrollbar {
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    ::-webkit-scrollbar-thumb {
      background: #b0b0b0;
      border-radius: 3px;
    }
  `]
})
export class ChatSupportComponent implements OnInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  isOpen = true;
  showRating = false;
  isTyping = false;
  newMessage = '';
  newSubject = '';
  selectedRating = 0;
  ratingFeedback = '';
  messages: any[] = [];
  conversations: any[] = [];
  supportAgents: any[] = [];
  currentConversationId: string | null = null;
  typingTimeout: any;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.loadConversations();
    this.loadSupportAgents();
    this.subscribeToChatMessages();
  }

  loadConversations() {
    this.chatService.getConversations().subscribe({
      next: (data: any[]) => {
        this.conversations = data;
        if (data.length > 0) {
          this.currentConversationId = data[0]._id;
          this.loadChatHistory();
        }
      }
    });
  }

  loadChatHistory() {
    if (this.currentConversationId) {
      this.chatService.getChatHistory(this.currentConversationId).subscribe({
        next: (data: any[]) => {
          this.messages = data;
          this.scrollToBottom();
        }
      });
    }
  }

  loadSupportAgents() {
    this.chatService.getSupportAgents().subscribe({
      next: (data: any[]) => {
        this.supportAgents = data;
      }
    });
  }

  subscribeToChatMessages() {
    this.chatService.messages$.subscribe((message: any) => {
      this.messages.push(message);
      this.scrollToBottom();
    });

    this.chatService.typing$.subscribe((data: any) => {
      if (data.isTyping) {
        this.isTyping = true;
      } else {
        this.isTyping = false;
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    // If starting new conversation
    if (!this.currentConversationId) {
      this.chatService.startSupportConversation(this.newSubject, this.newMessage).subscribe({
        next: (res: any) => {
          this.currentConversationId = res.conversationId;
          const msg = {
            conversationId: res.conversationId,
            message: this.newMessage,
            senderRole: 'user',
            senderName: 'You',
            createdAt: new Date()
          };
          this.messages.push(msg);
          this.newMessage = '';
          this.newSubject = '';
          this.scrollToBottom();
          
          // Simulate agent response
          setTimeout(() => {
            this.messages.push({
              conversationId: res.conversationId,
              message: 'Thanks for reaching out! Our support team will get back to you shortly.',
              senderRole: 'support_agent',
              senderName: 'Support Team',
              createdAt: new Date()
            });
            this.scrollToBottom();
          }, 1500);
        }
      });
    } else {
      // Send to existing conversation
      this.chatService.sendMessage(this.currentConversationId, this.newMessage);
      const msg = {
        conversationId: this.currentConversationId,
        message: this.newMessage,
        senderRole: 'user',
        senderName: 'You',
        createdAt: new Date()
      };
      this.messages.push(msg);
      this.newMessage = '';
      this.scrollToBottom();
    }
  }

  onTyping() {
    if (this.currentConversationId) {
      this.chatService.setTyping(this.currentConversationId, true);
      clearTimeout(this.typingTimeout);
      this.typingTimeout = setTimeout(() => {
        this.chatService.setTyping(this.currentConversationId!, false);
      }, 1000);
    }
  }

  rateConversation(stars: number) {
    this.selectedRating = stars;
  }

  submitRating() {
    if (this.currentConversationId) {
      this.chatService.rateConversation(this.currentConversationId, this.selectedRating, this.ratingFeedback).subscribe({
        next: () => {
          alert('Thank you for your feedback!');
          this.showRating = false;
          this.selectedRating = 0;
          this.ratingFeedback = '';
        }
      });
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 0);
  }
}
