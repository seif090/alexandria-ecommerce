/**
 * Alexandria Theme Configuration
 * Pharaonic-inspired colors and patterns
 * Historical Alexandria aesthetic with modern UI
 */

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    gold: string;
    turquoise: string;
    sand: string;
    charcoal: string;
  };
  gradients: {
    pharaonic: string;
    sunset: string;
    nile: string;
    regal: string;
  };
  patterns: {
    geometric: string;
    hieroglyphic: string;
    border: string;
  };
}

export const ALEXANDRIA_THEME: ThemeConfig = {
  colors: {
    // Primary Pharaonic colors
    primary: '#D4AF37', // Egyptian Gold
    secondary: '#06B6D4', // Nile Turquoise
    accent: '#8B4513', // Egyptian Brown
    gold: '#FFD700', // Bright Gold
    turquoise: '#40E0D0', // Turquoise
    sand: '#E6D7C3', // Desert Sand
    charcoal: '#2C3E50', // Deep Blue-Black
  },
  
  gradients: {
    // Pharaonic gold to turquoise
    pharaonic: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 25%, #40E0D0 75%, #06B6D4 100%)',
    
    // Sunset over Alexandria
    sunset: 'linear-gradient(180deg, #FF6B6B 0%, #FFD700 50%, #FF8C42 100%)',
    
    // Nile River blues
    nile: 'linear-gradient(135deg, #1a472a 0%, #06B6D4 50%, #40E0D0 100%)',
    
    // Regal purple gold
    regal: 'linear-gradient(135deg, #9b59b6 0%, #D4AF37 50%, #FFD700 100%)',
  },
  
  patterns: {
    // Egyptian geometric pattern border
    geometric: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M0,0 L10,10 M10,0 L0,10 M20,0 L30,10 M30,0 L20,10' stroke='%23D4AF37' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
    
    // Hieroglyphic-inspired pattern
    hieroglyphic: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M10,10 Q15,5 20,10 Q15,15 10,10 M40,10 Q45,5 50,10 Q45,15 40,10' stroke='%2340E0D0' stroke-width='1.5' fill='none'/%3E%3Crect x='5' y='25' width='50' height='3' fill='%23D4AF37'/%3E%3C/svg%3E")`,
    
    // Border pattern
    border: `repeating-linear-gradient(90deg, #D4AF37 0px, #D4AF37 10px, transparent 10px, transparent 20px)`,
  }
};

/**
 * Theme utility class
 */
export class AlexandriaTheme {
  static getPharaonicGradient(): string {
    return ALEXANDRIA_THEME.gradients.pharaonic;
  }

  static getGoldColor(): string {
    return ALEXANDRIA_THEME.colors.primary;
  }

  static getTurquoiseColor(): string {
    return ALEXANDRIA_THEME.colors.secondary;
  }

  static getSandColor(): string {
    return ALEXANDRIA_THEME.colors.sand;
  }

  static getCharcoalColor(): string {
    return ALEXANDRIA_THEME.colors.charcoal;
  }

  static getGeometricBorder(): string {
    return ALEXANDRIA_THEME.patterns.geometric;
  }

  static getHieroglyphicPattern(): string {
    return ALEXANDRIA_THEME.patterns.hieroglyphic;
  }

  static createBoxShadow(strength: 'light' | 'medium' | 'heavy' = 'medium'): string {
    const shadows = {
      light: `0 2px 8px rgba(212, 175, 55, 0.1),
              0 4px 12px rgba(64, 224, 208, 0.05)`,
      medium: `0 4px 12px rgba(212, 175, 55, 0.15),
               0 8px 24px rgba(64, 224, 208, 0.1),
               inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
      heavy: `0 8px 24px rgba(212, 175, 55, 0.2),
              0 16px 48px rgba(64, 224, 208, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)`
    };
    return shadows[strength];
  }

  static createBorderDecoration(): string {
    return `border: 2px solid;
            border-image: linear-gradient(135deg, #D4AF37 0%, #40E0D0 50%, #D4AF37 100%) 1;`;
  }

  /**
   * Create Tailwind-compatible theme utilities
   */
  static getTailwindConfig() {
    return {
      colors: {
        alexandria: {
          gold: '#D4AF37',
          turquoise: '#06B6D4',
          'turquoise-light': '#40E0D0',
          brown: '#8B4513',
          sand: '#E6D7C3',
          charcoal: '#2C3E50',
          'gold-light': '#FFD700',
          'bronze': '#CD7F32',
          'copper': '#B87333',
        }
      }
    };
  }
}

/**
 * Pharaonic color palette for components
 */
export const PHARAONIC_PALETTE = {
  // Main colors
  primary: '#D4AF37',     // Gold
  secondary: '#06B6D4',   // Turquoise
  accent: '#8B4513',      // Bronze
  
  // Backgrounds
  darkBg: '#1a1a2e',      // Deep background
  lightBg: '#f5f1e8',     // Sand/parchment background
  
  // Text
  darkText: '#2C3E50',    // Dark on light
  lightText: '#f5f1e8',   // Light on dark
  
  // Accents
  success: '#10b981',     // Green
  warning: '#f59e0b',     // Amber
  error: '#ef4444',       // Red
  info: '#3b82f6',        // Blue
  
  // Borders
  border: 'rgba(212, 175, 55, 0.2)',
  borderHeavy: '#D4AF37',
};

/**
 * Hieroglyphic decoration symbols
 */
export const HIEROGLYPHIC_SYMBOLS = {
  corner: '◤',
  line: '═',
  divider: '⸻',
  star: '✦',
  flower: '✿',
  wings: '⋈',
  cross: '✕',
  coin: '◉',
};
