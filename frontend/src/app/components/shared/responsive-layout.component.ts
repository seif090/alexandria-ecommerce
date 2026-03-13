import { Component, Directive, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Mobile-First Responsive Container
 * Provides automatic responsive behavior for child components
 */
@Component({
  selector: 'app-responsive-container',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="responsive-container" [ngClass]="containerClasses">
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .responsive-container {
      width: 100%;
      margin: 0 auto;
      padding-left: 1rem;
      padding-right: 1rem;
    }

    @media (min-width: 480px) {
      .responsive-container {
        padding-left: 1rem;
        padding-right: 1rem;
      }
    }

    @media (min-width: 768px) {
      .responsive-container {
        max-width: 768px;
        padding-left: 1.5rem;
        padding-right: 1.5rem;
      }
    }

    @media (min-width: 1024px) {
      .responsive-container {
        max-width: 1024px;
        padding-left: 2rem;
        padding-right: 2rem;
      }
    }

    @media (min-width: 1280px) {
      .responsive-container {
        max-width: 1280px;
        padding-left: 2rem;
        padding-right: 2rem;
      }
    }

    @media (min-width: 1920px) {
      .responsive-container {
        max-width: 1920px;
        padding-left: 2rem;
        padding-right: 2rem;
      }
    }
  `]
})
export class ResponsiveContainerComponent {
  @Input() maxWidth: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'lg';

  get containerClasses(): string {
    switch (this.maxWidth) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case 'full': return 'w-full';
      default: return 'max-w-lg';
    }
  }
}

/**
 * Mobile Bottom Sheet Navigation
 * Used for mobile navigation panels that slide from bottom
 */
@Component({
  selector: 'app-mobile-sheet',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mobile-sheet-overlay" *ngIf="isOpen" (click)="close()"></div>
    <div class="mobile-sheet" [class.open]="isOpen">
      <div class="mobile-sheet-handle"></div>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .mobile-sheet-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 40;
      animation: fadeIn 0.3s ease-out;
    }

    .mobile-sheet {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgb(15, 23, 42);
      border-radius: 1rem 1rem 0 0;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      max-height: 80vh;
      transform: translateY(100%);
      transition: transform 0.3s ease-out;
      z-index: 50;
    }

    .mobile-sheet.open {
      transform: translateY(0);
    }

    .mobile-sheet-handle {
      width: 3rem;
      height: 4px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      margin: 1rem auto;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @media (min-width: 768px) {
      .mobile-sheet-overlay,
      .mobile-sheet,
      .mobile-sheet-handle {
        display: none;
      }
    }
  `]
})
export class MobileSheetComponent {
  @Input() isOpen = false;

  close(): void {
    this.isOpen = false;
  }
}

/**
 * Responsive Grid Directive
 * Automatically adjusts grid columns based on screen size
 */
@Directive({
  selector: '[appResponsiveGrid]',
  standalone: true,
  host: {
    'class': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6'
  }
})
export class ResponsiveGridDirective {
  @Input('appResponsiveGrid') columns: 'auto' | '2' | '3' | '4' = 'auto';
}

/**
 * Responsive Text Directive
 * Scales text size based on screen size
 */
@Directive({
  selector: '[appResponsiveText]',
  standalone: true
})
export class ResponsiveTextDirective {
  @Input('appResponsiveText') size: 'sm' | 'md' | 'lg' | 'xl' = 'md';

  constructor(private el: any) {
    this.applyClasses();
  }

  private applyClasses(): void {
    const classes: { [key: string]: string } = {
      'sm': 'text-sm lg:text-base',
      'md': 'text-base lg:text-lg',
      'lg': 'text-lg lg:text-2xl',
      'xl': 'text-xl lg:text-3xl'
    };
    this.el.nativeElement.classList.add(...classes[this.size].split(' '));
  }
}

/**
 * Safe Area Directive (for notch/safe area insets on mobile)
 */
@Directive({
  selector: '[appSafeArea]',
  standalone: true,
  host: {
    'style': `
      padding-left: env(safe-area-inset-left);
      padding-right: env(safe-area-inset-right);
      padding-top: env(safe-area-inset-top);
      padding-bottom: env(safe-area-inset-bottom);
    `
  }
})
export class SafeAreaDirective { }

/**
 * Touch-Friendly Directive
 * Ensures buttons/interactive elements are at least 44x44px for touch
 */
@Directive({
  selector: 'button[appTouchFriendly], a[appTouchFriendly]',
  standalone: true,
  host: {
    'class': 'min-w-[2.75rem] min-h-[2.75rem] flex items-center justify-center'
  }
})
export class TouchFriendlyDirective { }

/**
 * Responsive Padding Directive
 */
@Directive({
  selector: '[appResponsivePadding]',
  standalone: true
})
export class ResponsivePaddingDirective {
  @Input('appResponsivePadding') size: 'sm' | 'md' | 'lg' = 'md';

  constructor(private el: any) {
    this.applyPadding();
  }

  private applyPadding(): void {
    const padding: { [key: string]: string } = {
      'sm': 'p-2 md:p-3 lg:p-4',
      'md': 'p-4 md:p-6 lg:p-8',
      'lg': 'p-6 md:p-8 lg:p-12'
    };
    this.el.nativeElement.classList.add(...padding[this.size].split(' '));
  }
}

/**
 * Responsive Typography Component
 */
@Component({
  selector: 'app-responsive-heading',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <component [ngSwitch]="level">
      <h1 *ngSwitchCase="1" [ngClass]="classes"><ng-content></ng-content></h1>
      <h2 *ngSwitchCase="2" [ngClass]="classes"><ng-content></ng-content></h2>
      <h3 *ngSwitchCase="3" [ngClass]="classes"><ng-content></ng-content></h3>
      <h4 *ngSwitchCase="4" [ngClass]="classes"><ng-content></ng-content></h4>
      <h5 *ngSwitchCase="5" [ngClass]="classes"><ng-content></ng-content></h5>
      <h6 *ngSwitchDefault [ngClass]="classes"><ng-content></ng-content></h6>
    </component>
  `,
  styles: []
})
export class ResponsiveHeadingComponent {
  @Input() level: 1 | 2 | 3 | 4 | 5 | 6 = 2;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'lg';

  get classes(): string {
    const sizeMap: { [key: string]: string } = {
      'sm': 'text-lg lg:text-xl font-black',
      'md': 'text-xl lg:text-2xl font-black',
      'lg': 'text-2xl lg:text-3xl font-black',
      'xl': 'text-3xl lg:text-4xl font-black'
    };
    return sizeMap[this.size];
  }
}

/**
 * Responsive Stack Component
 * Stacks vertically on mobile, horizontally on desktop
 */
@Component({
  selector: 'app-responsive-stack',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [ngClass]="containerClass">
      <ng-content></ng-content>
    </div>
  `
})
export class ResponsiveStackComponent {
  @Input() direction: 'row' | 'col' = 'col';
  @Input() gap: 'sm' | 'md' | 'lg' = 'md';
  @Input() mobileVertical = true;

  get containerClass(): string {
    const gapMap: { [key: string]: string } = {
      'sm': 'gap-2 lg:gap-3',
      'md': 'gap-4 lg:gap-6',
      'lg': 'gap-6 lg:gap-8'
    };
    
    const directionClass = this.mobileVertical
      ? `flex flex-col lg:flex-${this.direction}`
      : `flex flex-${this.direction}`;
    
    return `${directionClass} ${gapMap[this.gap]}`;
  }
}
