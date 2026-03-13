import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService, Language } from '../../services/translation.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative group">
      <button (click)="showMenu = !showMenu" class="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold transition-colors">
        <span *ngIf="currentLang === 'ar'">🇸🇦</span>
        <span *ngIf="currentLang === 'en'">🇬🇧</span>
        {{ currentLang === 'ar' ? 'العربية' : 'English' }}
        <span class="text-xs">▼</span>
      </button>

      <!-- Dropdown Menu -->
      <div *ngIf="showMenu" class="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
        <div class="p-2 space-y-1">
          <button 
            (click)="setLanguage('ar')"
            [class.bg-blue-100]="currentLang === 'ar'"
            class="w-full text-right px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors font-bold flex items-center gap-3">
            <span>🇸🇦</span>
            <span>العربية</span>
          </button>
          <button 
            (click)="setLanguage('en')"
            [class.bg-blue-100]="currentLang === 'en'"
            class="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors font-bold flex items-center gap-3">
            <span>🇬🇧</span>
            <span>English</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LanguageSwitcherComponent implements OnInit {
  currentLang: Language = 'ar';
  showMenu = false;

  constructor(private translationService: TranslationService) {}

  ngOnInit() {
    this.currentLang = this.translationService.getCurrentLanguageValue();
  }

  setLanguage(lang: Language) {
    this.translationService.setLanguage(lang);
    this.currentLang = lang;
    this.showMenu = false;
  }
}
