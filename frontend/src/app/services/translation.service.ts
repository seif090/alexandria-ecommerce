import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ar, en } from './translations';

export type Language = 'en' | 'ar';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage$ = new BehaviorSubject<Language>(
    (localStorage.getItem('lang') as Language) || 'ar'
  );

  private translations = { ar, en };

  constructor() {
    this.applyLanguageDirection();
  }

  getCurrentLanguage(): Observable<Language> {
    return this.currentLanguage$.asObservable();
  }

  getCurrentLanguageValue(): Language {
    return this.currentLanguage$.value;
  }

  setLanguage(lang: Language): void {
    this.currentLanguage$.next(lang);
    localStorage.setItem('lang', lang);
    this.applyLanguageDirection();
  }

  translate(key: string, params?: Record<string, any>): string {
    const lang = this.currentLanguage$.value;
    const keys = key.split('.');
    let value: any = (this.translations as any)[lang];

    for (const k of keys) {
      value = value?.[k];
    }

    if (!value) {
      value = (this.translations as any)['en']?.[keys[0]]?.[keys[1]] || key;
    }

    if (params) {
      Object.keys(params).forEach(param => {
        value = value.replace(`{{${param}}}`, params[param]);
      });
    }

    return value || key;
  }

  private applyLanguageDirection(): void {
    const lang = this.currentLanguage$.value;
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }
}
