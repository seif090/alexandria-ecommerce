import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from './services/cart.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, TranslateModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');
  
  constructor(public cartService: CartService, public translate: TranslateService) {
    this.translate.addLangs(['en', 'ar']);
    this.translate.setDefaultLang('en');
    
    // Check if browser language is Arabic, otherwise use default
    const browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang?.match(/en|ar/) ? browserLang : 'en');
    
    this.updateDir();
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    this.updateDir();
  }

  private updateDir() {
    // Handle RTL for Arabic
    const lang = this.translate.currentLang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang || 'en';
  }
}

