import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type ColorType = 'heptacromia' | 'pantone' | 'laca';

export interface PantoneColor {
  id?: number;
  code: string;
  name: string;
  displayName: string;
  hex: string;
  rgb: {
    r: number;
    g: number;
    b: number;
  };
  cmyk: {
    c: number;
    m: number;
    y: number;
    k: number;
  };
  lab?: {
    l: number | null;
    a: number | null;
    b: number | null;
  } | null;
  category: string;
  colorType: ColorType;
  isCustom?: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class PantoneLiveService {
  private http = inject(HttpClient);

  private pantoneColors: PantoneColor[] = [];
  private colorMap = new Map<string, PantoneColor>(); // Cache O(1) por código
  private loaded = false;
  private loading = false;
  colorsLoaded = signal<boolean>(false);

  // Colores base hardcodeados como fallback
  private fallbackColors: PantoneColor[] = [
    { code: 'Black', name: ' Black', displayName: 'Negro', hex: '#000000', rgb: { r: 0, g: 0, b: 0 }, cmyk: { c: 0, m: 0, y: 0, k: 100 }, category: 'Black', colorType: 'heptacromia' },
    { code: 'White', name: ' White', displayName: 'Blanco', hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, cmyk: { c: 0, m: 0, y: 0, k: 0 }, category: 'White', colorType: 'heptacromia' },
    { code: 'Cyan', name: ' Cyan', displayName: 'Cyan', hex: '#00AEEF', rgb: { r: 0, g: 174, b: 239 }, cmyk: { c: 100, m: 0, y: 0, k: 0 }, category: 'Cyan', colorType: 'heptacromia' },
    { code: 'Magenta', name: ' Magenta', displayName: 'Magenta', hex: '#EC008C', rgb: { r: 236, g: 0, b: 140 }, cmyk: { c: 0, m: 100, y: 0, k: 0 }, category: 'Pink', colorType: 'heptacromia' },
    { code: 'Yellow', name: ' Yellow', displayName: 'Amarillo', hex: '#FFF200', rgb: { r: 255, g: 242, b: 0 }, cmyk: { c: 0, m: 0, y: 100, k: 0 }, category: 'Yellow', colorType: 'heptacromia' },
    { code: 'Green', name: ' Green', displayName: 'Verde', hex: '#00A651', rgb: { r: 0, g: 166, b: 81 }, cmyk: { c: 100, m: 0, y: 51, k: 35 }, category: 'Green', colorType: 'heptacromia' },
    { code: 'Orange', name: ' Orange', displayName: 'Naranja', hex: '#FF6900', rgb: { r: 255, g: 105, b: 0 }, cmyk: { c: 0, m: 59, y: 100, k: 0 }, category: 'Orange', colorType: 'heptacromia' },
    { code: 'Violet', name: ' Violet', displayName: 'Violeta', hex: '#8B3F8F', rgb: { r: 139, g: 63, b: 143 }, cmyk: { c: 3, m: 56, y: 0, k: 44 }, category: 'Purple', colorType: 'heptacromia' },
  ];

  constructor() {
    // Iniciar con fallback, luego cargar desde API
    this.pantoneColors = [...this.fallbackColors];
    this.buildColorMap();
    this.loadFromApi();
  }

  private buildColorMap() {
    this.colorMap.clear();
    this.pantoneColors.forEach(c => {
      this.colorMap.set(c.code.toLowerCase(), c);
      this.colorMap.set(c.displayName.toLowerCase(), c);
      if (c.name) this.colorMap.set(c.name.trim().toLowerCase(), c);
    });
  }

  /**
   * Cargar colores desde la API (base de datos)
   */
  loadFromApi(): Promise<void> {
    if (this.loading) return Promise.resolve();
    this.loading = true;

    return new Promise((resolve) => {
      this.http.get<any[]>(`${environment.apiUrl}/pantone-colors`).subscribe({
        next: (colors) => {
          if (colors && colors.length > 0) {
            this.pantoneColors = colors.map(c => ({
              id: c.id,
              code: c.code,
              name: c.name,
              displayName: c.displayName,
              hex: c.hex,
              rgb: c.rgb || { r: 0, g: 0, b: 0 },
              cmyk: c.cmyk || { c: 0, m: 0, y: 0, k: 0 },
              lab: c.lab || null,
              category: c.category,
              colorType: c.colorType as ColorType,
              isCustom: c.isCustom || false
            }));
            this.buildColorMap();
          }
          this.loaded = true;
          this.loading = false;
          this.colorsLoaded.set(true);
          resolve();
        },
        error: () => {
          // Mantener fallback si falla la API
          this.loaded = true;
          this.loading = false;
          this.colorsLoaded.set(true);
          resolve();
        }
      });
    });
  }

  /**
   * Recargar colores desde la API (después de crear uno nuevo)
   */
  async reload(): Promise<void> {
    this.loading = false;
    this.loaded = false;
    await this.loadFromApi();
  }

  /**
   * Crear un nuevo color en la base de datos
   */
  createColor(colorData: {
    code: string;
    name?: string;
    displayName?: string;
    hex: string;
    rgbR: number;
    rgbG: number;
    rgbB: number;
    cmykC?: number;
    cmykM?: number;
    cmykY?: number;
    cmykK?: number;
    labL?: number | null;
    labA?: number | null;
    labB?: number | null;
    category?: string;
    colorType?: string;
  }): Promise<PantoneColor> {
    return new Promise((resolve, reject) => {
      this.http.post<any>(`${environment.apiUrl}/pantone-colors`, colorData).subscribe({
        next: async (result) => {
          const newColor: PantoneColor = {
            id: result.id,
            code: result.code,
            name: result.name,
            displayName: result.displayName,
            hex: result.hex,
            rgb: result.rgb,
            cmyk: result.cmyk,
            lab: result.lab,
            category: result.category,
            colorType: result.colorType as ColorType,
            isCustom: result.isCustom
          };
          // Agregar al array local inmediatamente
          this.pantoneColors.push(newColor);
          resolve(newColor);
        },
        error: (err) => reject(err)
      });
    });
  }

  /**
   * Actualizar un color existente en la base de datos
   */
  updateColor(id: number, colorData: {
    code: string;
    name?: string;
    displayName?: string;
    hex: string;
    rgbR: number;
    rgbG: number;
    rgbB: number;
    labL?: number | null;
    labA?: number | null;
    labB?: number | null;
    category?: string;
    colorType?: string;
  }): Promise<PantoneColor> {
    return new Promise((resolve, reject) => {
      this.http.put<any>(`${environment.apiUrl}/pantone-colors/${id}`, colorData).subscribe({
        next: (result) => {
          const updated: PantoneColor = {
            id: result.id,
            code: result.code,
            name: result.name,
            displayName: result.displayName,
            hex: result.hex,
            rgb: result.rgb,
            cmyk: result.cmyk,
            lab: result.lab,
            category: result.category,
            colorType: result.colorType as ColorType,
            isCustom: result.isCustom
          };
          // Actualizar en el array local
          const idx = this.pantoneColors.findIndex(c => c.id === id);
          if (idx >= 0) this.pantoneColors[idx] = updated;
          // Reconstruir el mapa para que búsquedas futuras encuentren el color actualizado
          this.buildColorMap();
          resolve(updated);
        },
        error: (err) => reject(err)
      });
    });
  }

  /**
   * Eliminar un color de la base de datos (solo custom)
   */
  deleteColor(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.delete<any>(`${environment.apiUrl}/pantone-colors/${id}`).subscribe({
        next: () => {
          // Remover del array local
          this.pantoneColors = this.pantoneColors.filter(c => c.id !== id);
          resolve();
        },
        error: (err) => reject(err)
      });
    });
  }

  getOrCreateColor(code: string): PantoneColor {
    const term = code.toLowerCase().trim();
    if (!term) return this.pantoneColors[0] || this.fallbackColors[0];

    const found = this.getColorByCode(code);
    if (found) return found;

    let cleanCode = term;
    if (cleanCode.startsWith('p ') || cleanCode.startsWith('p_')) {
      cleanCode = cleanCode.substring(2).trim();
    }

    const formattedDisplay = `P ${cleanCode.toUpperCase()}`;
    const hex = this.generateColorFromName(cleanCode);

    return {
      code: cleanCode,
      name: `Pantone ${cleanCode}`,
      displayName: formattedDisplay,
      hex: hex,
      rgb: this.hexToRgb(hex),
      cmyk: { c: 0, m: 0, y: 0, k: 40 },
      category: 'Manual',
      colorType: this.getColorType(code)
    };
  }

  private generateColorFromName(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('laca') || lowerName.includes('lacquer') || lowerName.includes('varnish')) {
      return '#B0B0B0';
    }
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 138, g: 141, b: 143 };
  }

  getAllColors(): PantoneColor[] {
    return [...this.pantoneColors];
  }

  getColorByCode(code: string): PantoneColor | undefined {
    const term = code.toLowerCase().trim();

    let cleanCode = term;
    if (term.startsWith('p ')) cleanCode = term.substring(2).trim();
    else if (term.startsWith('p_')) cleanCode = term.substring(2).trim();
    else if (term.startsWith('pantone ')) cleanCode = term.substring(8).trim();

    // Búsqueda rápida O(1) en Map
    const mapResult = this.colorMap.get(term) || this.colorMap.get(cleanCode) || this.colorMap.get(`p ${cleanCode}`);
    if (mapResult) return mapResult;

    // Fallback: búsqueda lineal (solo si Map no tiene el resultado)
    return this.pantoneColors.find(color =>
      color.code.toLowerCase() === cleanCode ||
      color.code.toLowerCase() === term ||
      color.displayName.toLowerCase() === term
    );
  }

  searchByCode(code: string): PantoneColor[] {
    const term = code.toLowerCase().trim();
    if (!term) return this.pantoneColors;
    const isNumeric = /^\d+$/.test(term);

    return this.pantoneColors.filter(color => {
      if (isNumeric) return color.code.startsWith(term);
      return color.code.toLowerCase().includes(term) || color.displayName.toLowerCase().includes(term);
    }).slice(0, 50);
  }

  getMostUsedColors(): PantoneColor[] {
    const mostUsed = ['Black', 'White', 'NEGRO', 'BLANCO', '186', '193', '286', '302', '348', '120', '3265', '1925', '7409', 'Yellow', 'Cyan', 'Magenta'];
    return this.pantoneColors.filter(c => mostUsed.includes(c.code));
  }

  searchColors(searchTerm: string): PantoneColor[] {
    return this.searchByCode(searchTerm);
  }

  formatColorForDisplay(color: PantoneColor): string {
    return `${color.displayName} - ${color.hex}`;
  }

  getContrastColor(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  // ===== MÉTODOS DE CLASIFICACIÓN POR TIPO =====

  getheptacromiaColors(): PantoneColor[] {
    return this.pantoneColors.filter(c => c.colorType === 'heptacromia');
  }

  getPantoneColors(): PantoneColor[] {
    return this.pantoneColors.filter(c => c.colorType === 'pantone');
  }

  getLacaColors(): PantoneColor[] {
    return this.pantoneColors.filter(c => c.colorType === 'laca');
  }

  getColorType(colorName: string): ColorType {
    if (!colorName) return 'pantone';
    const upper = colorName.trim().toUpperCase();
    
    const heptaCodes = ['BLACK', 'WHITE', 'CYAN', 'MAGENTA', 'YELLOW', 'GREEN', 'ORANGE', 'VIOLET',
                        'NEGRO', 'BLANCO', 'AMARILLO', 'VERDE', 'NARANJA', 'VIOLETA'];
    if (heptaCodes.includes(upper)) return 'heptacromia';
    
    if (upper.includes('LACA') || upper.includes('BARNIZ') || upper.includes('MATE') || 
        upper.includes('BRILLO') || upper.includes('VARNISH') || upper.includes('LACQUER') ||
        upper.includes('PRIMER') || upper.includes('TERMO') || upper.includes('REGISTRO') ||
        upper.includes('REG_') || upper.includes('_REG') || upper.includes('SELLADOR') ||
        upper.includes('ADHESIVO') || upper.includes('PROTECTOR')) return 'laca';
    
    return 'pantone';
  }

  countByType(colorNames: string[]): { heptacromia: number, pantone: number, laca: number } {
    const result = { heptacromia: 0, pantone: 0, laca: 0 };
    colorNames.forEach(name => {
      const type = this.getColorType(name);
      result[type]++;
    });
    return result;
  }

  filterPantoneOnly(colorNames: string[]): string[] {
    return colorNames.filter(name => this.getColorType(name) === 'pantone');
  }

  filterheptacromiaOnly(colorNames: string[]): string[] {
    return colorNames.filter(name => this.getColorType(name) === 'heptacromia');
  }
}
