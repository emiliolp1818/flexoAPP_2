import { Injectable } from '@angular/core';

/**
 * Interface para definir un color Pantone Live
 */
export interface PantoneColor {
  code: string;        // Código Pantone (ej: "209")
  name: string;        // Nombre completo (ej: "Pantone 209")
  displayName: string; // Nombre para mostrar (ej: "P 209")
  hex: string;         // Valor hexadecimal del color
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
  category: string;    // Categoría del color (ej: "Red", "Blue", etc.)
}

/**
 * Servicio para gestionar la librería de colores Pantone Live
 */
@Injectable({
  providedIn: 'root'
})
export class PantoneLiveService {

  /**
   * Librería de colores Pantone Live para flexografía
   * Incluye colores básicos y una extensión de la guía Solid Coated 2024
   */
  private pantoneColors: PantoneColor[] = [
    // ===== COLORES BÁSICOS ESENCIALES =====
    { code: 'Black', name: 'Pantone Black', displayName: 'P Black', hex: '#000000', rgb: { r: 0, g: 0, b: 0 }, cmyk: { c: 0, m: 0, y: 0, k: 100 }, category: 'Black' },
    { code: 'White', name: 'Pantone White', displayName: 'P White', hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, cmyk: { c: 0, m: 0, y: 0, k: 0 }, category: 'White' },
    { code: 'Cyan', name: 'Pantone Cyan', displayName: 'P Cyan', hex: '#00AEEF', rgb: { r: 0, g: 174, b: 239 }, cmyk: { c: 100, m: 0, y: 0, k: 0 }, category: 'Cyan' },
    { code: 'Magenta', name: 'Pantone Magenta', displayName: 'P Magenta', hex: '#EC008C', rgb: { r: 236, g: 0, b: 140 }, cmyk: { c: 0, m: 100, y: 0, k: 0 }, category: 'Pink' },
    { code: 'Yellow', name: 'Pantone Yellow', displayName: 'P Yellow', hex: '#FFF200', rgb: { r: 255, g: 242, b: 0 }, cmyk: { c: 0, m: 0, y: 100, k: 0 }, category: 'Yellow' },

    // ===== ROJOS =====
    { code: '185', name: 'Pantone 185 C', displayName: 'P 185', hex: '#E4002B', rgb: { r: 228, g: 0, b: 43 }, cmyk: { c: 0, m: 100, y: 81, k: 11 }, category: 'Red' },
    { code: '186', name: 'Pantone 186 C', displayName: 'P 186', hex: '#CE1126', rgb: { r: 206, g: 17, b: 38 }, cmyk: { c: 0, m: 92, y: 82, k: 19 }, category: 'Red' },
    { code: '187', name: 'Pantone 187 C', displayName: 'P 187', hex: '#A6192E', rgb: { r: 166, g: 25, b: 46 }, cmyk: { c: 0, m: 85, y: 72, k: 35 }, category: 'Red' },
    { code: '200', name: 'Pantone 200 C', displayName: 'P 200', hex: '#C4004A', rgb: { r: 196, g: 0, b: 74 }, cmyk: { c: 0, m: 100, y: 62, k: 23 }, category: 'Red' },
    { code: '485', name: 'Pantone 485 C', displayName: 'P 485', hex: '#DA020E', rgb: { r: 218, g: 2, b: 14 }, cmyk: { c: 0, m: 99, y: 94, k: 15 }, category: 'Red' },

    // ===== AZULES =====
    { code: '285', name: 'Pantone 285 C', displayName: 'P 285', hex: '#0072CE', rgb: { r: 0, g: 114, b: 206 }, cmyk: { c: 74, m: 43, y: 0, k: 0 }, category: 'Blue' },
    { code: '286', name: 'Pantone 286 C', displayName: 'P 286', hex: '#0033A0', rgb: { r: 0, g: 51, b: 160 }, cmyk: { c: 100, m: 68, y: 0, k: 37 }, category: 'Blue' },
    { code: '2925', name: 'Pantone 2925 C', displayName: 'P 2925', hex: '#009CDE', rgb: { r: 0, g: 156, b: 222 }, cmyk: { c: 100, m: 30, y: 0, k: 13 }, category: 'Blue' },
    { code: 'Reflex Blue', name: 'Pantone Reflex Blue', displayName: 'P Reflex Blue', hex: '#001489', rgb: { r: 0, g: 20, b: 137 }, cmyk: { c: 100, m: 82, y: 0, k: 46 }, category: 'Blue' },

    // ===== VERDES =====
    { code: '347', name: 'Pantone 347 C', displayName: 'P 347', hex: '#009639', rgb: { r: 0, g: 150, b: 57 }, cmyk: { c: 100, m: 0, y: 62, k: 41 }, category: 'Green' },
    { code: '348', name: 'Pantone 348 C', displayName: 'P 348', hex: '#00843D', rgb: { r: 0, g: 132, b: 61 }, cmyk: { c: 100, m: 0, y: 54, k: 48 }, category: 'Green' },
    { code: '355', name: 'Pantone 355 C', displayName: 'P 355', hex: '#009639', rgb: { r: 0, g: 150, b: 57 }, cmyk: { c: 100, m: 0, y: 100, k: 5 }, category: 'Green' },
    { code: '376', name: 'Pantone 376 C', displayName: 'P 376', hex: '#84BD00', rgb: { r: 132, g: 189, b: 0 }, cmyk: { c: 55, m: 0, y: 100, k: 5 }, category: 'Green' },

    // ===== GRISES Y METÁLICOS =====
    { code: 'Cool Gray 7', name: 'Pantone Cool Gray 7 C', displayName: 'P CG 7', hex: '#97999B', rgb: { r: 151, g: 153, b: 155 }, cmyk: { c: 0, m: 0, y: 0, k: 45 }, category: 'Gray' },
    { code: '877', name: 'Pantone 877 C', displayName: 'P 877', hex: '#8A8D8F', rgb: { r: 138, g: 141, b: 143 }, cmyk: { c: 45, m: 34, y: 34, k: 0 }, category: 'Metallic' },

    // ===== EXTENSIÓN SOLID COATED (Muestra representativa adicional) =====
    { code: '100', name: 'Pantone 100 C', displayName: 'P 100', hex: '#F6EB61', rgb: { r: 246, g: 235, b: 97 }, cmyk: { c: 0, m: 0, y: 57, k: 0 }, category: 'Yellow' },
    { code: '101', name: 'Pantone 101 C', displayName: 'P 101', hex: '#F7EA48', rgb: { r: 247, g: 234, b: 72 }, cmyk: { c: 0, m: 0, y: 68, k: 0 }, category: 'Yellow' },
    { code: '102', name: 'Pantone 102 C', displayName: 'P 102', hex: '#FCE300', rgb: { r: 252, g: 227, b: 0 }, cmyk: { c: 0, m: 0, y: 95, k: 0 }, category: 'Yellow' },
    { code: '123', name: 'Pantone 123 C', displayName: 'P 123', hex: '#FFC82E', rgb: { r: 255, g: 200, b: 46 }, cmyk: { c: 0, m: 19, y: 89, k: 0 }, category: 'Yellow' },
    { code: '1505', name: 'Pantone 1505 C', displayName: 'P 1505', hex: '#FF6900', rgb: { r: 255, g: 105, b: 0 }, cmyk: { c: 0, m: 56, y: 90, k: 0 }, category: 'Orange' },
    { code: '1788', name: 'Pantone 1788 C', displayName: 'P 1788', hex: '#EE2C2C', rgb: { r: 238, g: 44, b: 44 }, cmyk: { c: 0, m: 84, y: 77, k: 0 }, category: 'Red' },
    { code: '210', name: 'Pantone 210 C', displayName: 'P 210', hex: '#F9A7B0', rgb: { r: 249, g: 167, b: 176 }, cmyk: { c: 0, m: 42, y: 17, k: 0 }, category: 'Pink' },
    { code: '211', name: 'Pantone 211 C', displayName: 'P 211', hex: '#F69AB0', rgb: { r: 246, g: 154, b: 176 }, cmyk: { c: 0, m: 48, y: 20, k: 0 }, category: 'Pink' },
    { code: '212', name: 'Pantone 212 C', displayName: 'P 212', hex: '#F25278', rgb: { r: 242, g: 82, b: 120 }, cmyk: { c: 0, m: 73, y: 35, k: 0 }, category: 'Pink' },
    { code: '233', name: 'Pantone 233 C', displayName: 'P 233', hex: '#B3006B', rgb: { r: 179, g: 0, b: 107 }, cmyk: { c: 12, m: 100, y: 5, k: 18 }, category: 'Purple' },
    { code: '256', name: 'Pantone 256 C', displayName: 'P 256', hex: '#D8A0DB', rgb: { r: 216, g: 160, b: 219 }, cmyk: { c: 16, m: 39, y: 0, k: 0 }, category: 'Purple' },
    { code: '257', name: 'Pantone 257 C', displayName: 'P 257', hex: '#CD92D2', rgb: { r: 205, g: 146, b: 210 }, cmyk: { c: 23, m: 49, y: 0, k: 0 }, category: 'Purple' },
    { code: '258', name: 'Pantone 258 C', displayName: 'P 258', hex: '#8E5294', rgb: { r: 142, g: 82, b: 148 }, cmyk: { c: 52, m: 80, y: 0, k: 0 }, category: 'Purple' },
    { code: '259', name: 'Pantone 259 C', displayName: 'P 259', hex: '#6A2A6D', rgb: { r: 106, g: 42, b: 109 }, cmyk: { c: 66, m: 99, y: 5, k: 12 }, category: 'Purple' },
    { code: '260', name: 'Pantone 260 C', displayName: 'P 260', hex: '#601F5E', rgb: { r: 96, g: 31, b: 94 }, cmyk: { c: 68, m: 100, y: 12, k: 25 }, category: 'Purple' },
    { code: '261', name: 'Pantone 261 C', displayName: 'P 261', hex: '#54134E', rgb: { r: 84, g: 19, b: 78 }, cmyk: { c: 69, m: 100, y: 20, k: 38 }, category: 'Purple' },
    { code: '262', name: 'Pantone 262 C', displayName: 'P 262', hex: '#440A3D', rgb: { r: 68, g: 10, b: 61 }, cmyk: { c: 72, m: 100, y: 29, k: 54 }, category: 'Purple' },
    { code: '270', name: 'Pantone 270 C', displayName: 'P 270', hex: '#B8A9D1', rgb: { r: 184, g: 169, b: 209 }, cmyk: { c: 23, m: 28, y: 0, k: 0 }, category: 'Blue' },
    { code: '271', name: 'Pantone 271 C', displayName: 'P 271', hex: '#A391C6', rgb: { r: 163, g: 145, b: 198 }, cmyk: { c: 35, m: 41, y: 0, k: 0 }, category: 'Blue' },
    { code: '272', name: 'Pantone 272 C', displayName: 'P 272', hex: '#7578BC', rgb: { r: 117, g: 120, b: 188 }, cmyk: { c: 54, m: 50, y: 0, k: 0 }, category: 'Blue' },
    { code: '273', name: 'Pantone 273 C', displayName: 'P 273', hex: '#241773', rgb: { r: 36, g: 23, b: 115 }, cmyk: { c: 100, m: 100, y: 0, k: 18 }, category: 'Blue' },
    { code: '274', name: 'Pantone 274 C', displayName: 'P 274', hex: '#211551', rgb: { r: 33, g: 21, b: 81 }, cmyk: { c: 100, m: 100, y: 0, k: 50 }, category: 'Blue' },
    { code: '275', name: 'Pantone 275 C', displayName: 'P 275', hex: '#1E163D', rgb: { r: 30, g: 22, b: 61 }, cmyk: { c: 100, m: 100, y: 0, k: 68 }, category: 'Blue' },
    { code: '276', name: 'Pantone 276 C', displayName: 'P 276', hex: '#1A142A', rgb: { r: 26, g: 20, b: 42 }, cmyk: { c: 100, m: 100, y: 0, k: 80 }, category: 'Blue' },
    { code: '277', name: 'Pantone 277 C', displayName: 'P 277', hex: '#B8CBE6', rgb: { r: 184, g: 203, b: 230 }, cmyk: { c: 23, m: 10, y: 0, k: 0 }, category: 'Blue' },
    { code: '278', name: 'Pantone 278 C', displayName: 'P 278', hex: '#8BB8E8', rgb: { r: 139, g: 184, b: 232 }, cmyk: { c: 43, m: 16, y: 0, k: 0 }, category: 'Blue' },
    { code: '279', name: 'Pantone 279 C', displayName: 'P 279', hex: '#418FDE', rgb: { r: 65, g: 143, b: 222 }, cmyk: { c: 71, m: 36, y: 0, k: 0 }, category: 'Blue' },
    { code: '280', name: 'Pantone 280 C', displayName: 'P 280', hex: '#012169', rgb: { r: 1, g: 33, b: 105 }, cmyk: { c: 100, m: 85, y: 5, k: 22 }, category: 'Blue' },
    { code: '281', name: 'Pantone 281 C', displayName: 'P 281', hex: '#00205B', rgb: { r: 0, g: 32, b: 91 }, cmyk: { c: 100, m: 85, y: 5, k: 39 }, category: 'Blue' },
    { code: '282', name: 'Pantone 282 C', displayName: 'P 282', hex: '#041E42', rgb: { r: 4, g: 30, b: 66 }, cmyk: { c: 100, m: 80, y: 10, k: 60 }, category: 'Blue' },
    { code: '290', name: 'Pantone 290 C', displayName: 'P 290', hex: '#B9D9EB', rgb: { r: 185, g: 217, b: 235 }, cmyk: { c: 23, m: 3, y: 0, k: 0 }, category: 'Blue' },
    { code: '291', name: 'Pantone 291 C', displayName: 'P 291', hex: '#9BCBEB', rgb: { r: 155, g: 203, b: 235 }, cmyk: { c: 35, m: 4, y: 0, k: 0 }, category: 'Blue' },
    { code: '292', name: 'Pantone 292 C', displayName: 'P 292', hex: '#69B3E7', rgb: { r: 105, g: 179, b: 231 }, cmyk: { c: 59, m: 13, y: 0, k: 0 }, category: 'Blue' },
  ];

  constructor() { }

  /**
   * Obtiene un color o crea uno temporal.
   * Asegura que el formato sea "P [CÓDIGO]"
   */
  getOrCreateColor(code: string): PantoneColor {
    const term = code.toLowerCase().trim();
    if (!term) return this.pantoneColors[0];

    const found = this.getColorByCode(code);
    if (found) return found;

    // Formatear el código para que siempre tenga el prefijo P
    const cleanCode = term.startsWith('p ') ? term.substring(2).trim() : term;
    const formattedDisplay = `P ${cleanCode.toUpperCase()}`;

    return {
      code: cleanCode,
      name: `Pantone ${cleanCode}`,
      displayName: formattedDisplay,
      hex: '#8A8D8F', // Gris neutro para manuales
      rgb: { r: 138, g: 141, b: 143 },
      cmyk: { c: 0, m: 0, y: 0, k: 40 },
      category: 'Manual'
    };
  }

  getAllColors(): PantoneColor[] {
    return [...this.pantoneColors];
  }

  /**
   * Busca un color por código, nombre o nombre de visualización.
   * Soporta formatos: "209", "P 209", "Pantone 209"
   */
  getColorByCode(code: string): PantoneColor | undefined {
    const term = code.toLowerCase().trim();

    // Extraer el número si viene con prefijos
    let cleanCode = term;
    if (term.startsWith('p ')) cleanCode = term.substring(2).trim();
    else if (term.startsWith('pantone ')) cleanCode = term.substring(8).trim();

    return this.pantoneColors.find(color =>
      color.code.toLowerCase() === cleanCode ||
      color.displayName.toLowerCase() === term ||
      color.displayName.toLowerCase() === `p ${cleanCode}` ||
      color.name.toLowerCase() === term
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
    const mostUsed = ['Black', 'White', '186', '286', '348', 'Yellow', 'Cyan', 'Magenta'];
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
}