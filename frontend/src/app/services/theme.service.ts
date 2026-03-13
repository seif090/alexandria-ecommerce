import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ALEXANDRIA_THEME, AlexandriaTheme, PHARAONIC_PALETTE } from '../themes/alexandria.theme';

export interface ThemeSettings {
  mode: 'light' | 'dark';
  intensity: 'subtle' | 'medium' | 'bold';
  enableAnimations: boolean;
  enablePatterns: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSettings$ = new BehaviorSubject<ThemeSettings>({
    mode: 'dark',
    intensity: 'medium',
    enableAnimations: true,
    enablePatterns: true
  });

  private currentTheme$ = new BehaviorSubject(ALEXANDRIA_THEME);

  constructor() {
    this.initializeTheme();
  }

  /**
   * Initialize theme on app startup
   */
  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('alexandria-theme');
    if (savedTheme) {
      try {
        const settings = JSON.parse(savedTheme);
        this.themeSettings$.next(settings);
      } catch {
        this.applyDefaultTheme();
      }
    } else {
      this.applyDefaultTheme();
    }
    this.applyThemeToDocument();
  }

  /**
   * Apply default theme
   */
  private applyDefaultTheme(): void {
    const defaultSettings: ThemeSettings = {
      mode: 'dark',
      intensity: 'medium',
      enableAnimations: true,
      enablePatterns: true
    };
    this.themeSettings$.next(defaultSettings);
    localStorage.setItem('alexandria-theme', JSON.stringify(defaultSettings));
  }

  /**
   * Get current theme settings
   */
  getThemeSettings(): Observable<ThemeSettings> {
    return this.themeSettings$.asObservable();
  }

  /**
   * Get current theme value
   */
  getThemeSettingsValue(): ThemeSettings {
    return this.themeSettings$.getValue();
  }

  /**
   * Update theme mode
   */
  setThemeMode(mode: 'light' | 'dark'): void {
    const current = this.themeSettings$.getValue();
    const updated: ThemeSettings = { ...current, mode };
    this.themeSettings$.next(updated);
    localStorage.setItem('alexandria-theme', JSON.stringify(updated));
    this.applyThemeToDocument();
  }

  /**
   * Set theme intensity
   */
  setThemeIntensity(intensity: 'subtle' | 'medium' | 'bold'): void {
    const current = this.themeSettings$.getValue();
    const updated: ThemeSettings = { ...current, intensity };
    this.themeSettings$.next(updated);
    localStorage.setItem('alexandria-theme', JSON.stringify(updated));
    this.applyThemeToDocument();
  }

  /**
   * Apply theme to document
   */
  private applyThemeToDocument(): void {
    const settings = this.themeSettings$.getValue();
    const root = document.documentElement;

    // Set theme mode
    if (settings.mode === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    // Set intensity class
    root.classList.remove('intensity-subtle', 'intensity-medium', 'intensity-bold');
    root.classList.add(`intensity-${settings.intensity}`);

    // Apply CSS variables for theme colors
    this.applyCSSVariables();
  }

  /**
   * Apply CSS variables to document
   */
  private applyCSSVariables(): void {
    const root = document.documentElement;
    const colors = ALEXANDRIA_THEME.colors;
    const palette = PHARAONIC_PALETTE;

    // Primary colors
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-gold', colors.gold);
    root.style.setProperty('--color-turquoise', colors.turquoise);
    root.style.setProperty('--color-sand', colors.sand);
    root.style.setProperty('--color-charcoal', colors.charcoal);

    // Palette
    root.style.setProperty('--bg-dark', palette.darkBg);
    root.style.setProperty('--bg-light', palette.lightBg);
    root.style.setProperty('--text-dark', palette.darkText);
    root.style.setProperty('--text-light', palette.lightText);

    // Gradients
    root.style.setProperty('--gradient-pharaonic', ALEXANDRIA_THEME.gradients.pharaonic);
    root.style.setProperty('--gradient-sunset', ALEXANDRIA_THEME.gradients.sunset);
    root.style.setProperty('--gradient-nile', ALEXANDRIA_THEME.gradients.nile);
    root.style.setProperty('--gradient-regal', ALEXANDRIA_THEME.gradients.regal);
  }

  /**
   * Get color by name
   */
  getColor(colorName: keyof typeof PHARAONIC_PALETTE): string {
    return PHARAONIC_PALETTE[colorName];
  }

  /**
   * Get gradient
   */
  getGradient(gradientName: 'pharaonic' | 'sunset' | 'nile' | 'regal'): string {
    return ALEXANDRIA_THEME.gradients[gradientName];
  }

  /**
   * Get theme utility class
   */
  getThemeUtil(): typeof AlexandriaTheme {
    return AlexandriaTheme;
  }

  /**
   * Create component styling
   */
  createComponentStyle(config: {
    background?: string;
    border?: boolean;
    shadow?: 'light' | 'medium' | 'heavy';
    pattern?: boolean;
  }): any {
    const style: any = {};

    if (config.background === 'gradient') {
      style.background = ALEXANDRIA_THEME.gradients.pharaonic;
    }

    if (config.border) {
      style.border = `2px solid ${PHARAONIC_PALETTE.borderHeavy}`;
      style.borderRadius = '8px';
    }

    if (config.shadow) {
      style.boxShadow = AlexandriaTheme.createBoxShadow(config.shadow);
    }

    if (config.pattern) {
      style.backgroundImage = ALEXANDRIA_THEME.patterns.geometric;
    }

    return style;
  }

  /**
   * Toggle animations
   */
  setAnimationsEnabled(enabled: boolean): void {
    const current = this.themeSettings$.getValue();
    const updated: ThemeSettings = { ...current, enableAnimations: enabled };
    this.themeSettings$.next(updated);
    localStorage.setItem('alexandria-theme', JSON.stringify(updated));
  }

  /**
   * Toggle patterns
   */
  setPatternEnabled(enabled: boolean): void {
    const current = this.themeSettings$.getValue();
    const updated: ThemeSettings = { ...current, enablePatterns: enabled };
    this.themeSettings$.next(updated);
    localStorage.setItem('alexandria-theme', JSON.stringify(updated));
  }

  /**
   * Reset to default theme
   */
  resetTheme(): void {
    this.applyDefaultTheme();
    this.applyThemeToDocument();
  }
}
