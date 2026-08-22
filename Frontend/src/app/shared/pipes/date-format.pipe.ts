import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localDate',
  standalone: true,
  pure: true
})
export class LocalDatePipe implements PipeTransform {
  transform(dateStr: string | Date | null | undefined, mode: 'full' | 'date' | 'time' = 'full'): string {
    if (!dateStr) return '';
    const str = String(dateStr);
    
    const match = str.match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    if (match) {
      const [, yyyy, mm, dd, hh, mi] = match;
      if (mode === 'date') return `${dd}/${mm}/${yyyy}`;
      if (mode === 'time') return `${hh}:${mi}`;
      return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
    }

    const d = new Date(str);
    if (isNaN(d.getTime())) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    if (mode === 'date') return `${dd}/${mm}/${d.getFullYear()}`;
    if (mode === 'time') return `${hh}:${mi}`;
    return `${dd}/${mm}/${d.getFullYear()} ${hh}:${mi}`;
  }
}

@Pipe({
  name: 'localTime12h',
  standalone: true,
  pure: true
})
export class LocalTime12hPipe implements PipeTransform {
  transform(dateStr: string | Date | null | undefined): string {
    if (!dateStr) return '';
    const str = String(dateStr);
    const match = str.match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
    let h = 0, m = 0;
    if (match) {
      h = parseInt(match[4], 10);
      m = parseInt(match[5], 10);
    } else {
      const d = new Date(str);
      if (isNaN(d.getTime())) return '';
      h = d.getHours();
      m = d.getMinutes();
    }
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  }
}

@Pipe({
  name: 'formatKilos',
  standalone: true,
  pure: true
})
export class FormatKilosPipe implements PipeTransform {
  transform(kilos: number | null | undefined): string {
    if (kilos === null || kilos === undefined) return '0';
    return Math.floor(kilos).toString();
  }
}

@Pipe({
  name: 'formatMetros',
  standalone: true,
  pure: true
})
export class FormatMetrosPipe implements PipeTransform {
  transform(metros: number | null | undefined): string {
    if (!metros) return '0';
    return Math.floor(metros).toString();
  }
}
