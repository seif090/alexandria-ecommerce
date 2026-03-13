import { Pipe, PipeTransform, ChangeDetectorRef } from '@angular/core';
import { TranslationService } from './translation.service';

@Pipe({
  name: 'translate',
  pure: false,
  standalone: true
})
export class TranslatePipe implements PipeTransform {
  constructor(
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {
    this.translationService.getCurrentLanguage().subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  transform(key: string, params?: Record<string, any>): string {
    return this.translationService.translate(key, params);
  }
}
