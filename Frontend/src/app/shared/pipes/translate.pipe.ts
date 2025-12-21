import { Pipe, PipeTransform, inject } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false  // Permite que el pipe se actualice cuando cambia el idioma
})
export class TranslatePipe implements PipeTransform {
  private languageService = inject(LanguageService);

  transform(key: string, params?: { [key: string]: string }): string {
    if (params) {
      return this.languageService.translateWithParams(key, params);
    }
    return this.languageService.translate(key);
  }
}
