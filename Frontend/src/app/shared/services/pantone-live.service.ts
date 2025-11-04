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
 * Proporciona acceso a los colores Pantone más utilizados en flexografía
 */
@Injectable({
  providedIn: 'root'
})
export class PantoneLiveService {

  /**
   * Librería de colores Pantone Live más utilizados en flexografía
   * Cada color incluye código, nombre, valores hex, RGB y CMYK
   */
  private pantoneColors: PantoneColor[] = [
    // ROJOS
    {
      code: '18-1664',
      name: 'Pantone 18-1664',
      displayName: 'P 18-1664',
      hex: '#C8102E',
      rgb: { r: 200, g: 16, b: 46 },
      cmyk: { c: 0, m: 92, y: 77, k: 22 },
      category: 'Red'
    },
    {
      code: '209',
      name: 'Pantone 209',
      displayName: 'P 209',
      hex: '#8B1538',
      rgb: { r: 139, g: 21, b: 56 },
      cmyk: { c: 0, m: 85, y: 60, k: 45 },
      category: 'Red'
    },
    {
      code: '186',
      name: 'Pantone 186',
      displayName: 'P 186',
      hex: '#CE1126',
      rgb: { r: 206, g: 17, b: 38 },
      cmyk: { c: 0, m: 92, y: 82, k: 19 },
      category: 'Red'
    },
    {
      code: '485',
      name: 'Pantone 485',
      displayName: 'P 485',
      hex: '#DA020E',
      rgb: { r: 218, g: 2, b: 14 },
      cmyk: { c: 0, m: 99, y: 94, k: 15 },
      category: 'Red'
    },

    // AZULES
    {
      code: '286',
      name: 'Pantone 286',
      displayName: 'P 286',
      hex: '#0033A0',
      rgb: { r: 0, g: 51, b: 160 },
      cmyk: { c: 100, m: 68, y: 0, k: 37 },
      category: 'Blue'
    },
    {
      code: '2925',
      name: 'Pantone 2925',
      displayName: 'P 2925',
      hex: '#009CDE',
      rgb: { r: 0, g: 156, b: 222 },
      cmyk: { c: 100, m: 30, y: 0, k: 13 },
      category: 'Blue'
    },
    {
      code: '3005',
      name: 'Pantone 3005',
      displayName: 'P 3005',
      hex: '#0085CA',
      rgb: { r: 0, g: 133, b: 202 },
      cmyk: { c: 100, m: 34, y: 0, k: 21 },
      category: 'Blue'
    },
    {
      code: '072',
      name: 'Pantone 072',
      displayName: 'P 072',
      hex: '#2E3192',
      rgb: { r: 46, g: 49, b: 146 },
      cmyk: { c: 68, m: 66, y: 0, k: 43 },
      category: 'Blue'
    },

    // VERDES
    {
      code: '348',
      name: 'Pantone 348',
      displayName: 'P 348',
      hex: '#00A651',
      rgb: { r: 0, g: 166, b: 81 },
      cmyk: { c: 100, m: 0, y: 51, k: 35 },
      category: 'Green'
    },
    {
      code: '355',
      name: 'Pantone 355',
      displayName: 'P 355',
      hex: '#009639',
      rgb: { r: 0, g: 150, b: 57 },
      cmyk: { c: 100, m: 0, y: 62, k: 41 },
      category: 'Green'
    },
    {
      code: '376',
      name: 'Pantone 376',
      displayName: 'P 376',
      hex: '#7CB518',
      rgb: { r: 124, g: 181, b: 24 },
      cmyk: { c: 31, m: 0, y: 87, k: 29 },
      category: 'Green'
    },

    // AMARILLOS
    {
      code: '116',
      name: 'Pantone 116',
      displayName: 'P 116',
      hex: '#FFED00',
      rgb: { r: 255, g: 237, b: 0 },
      cmyk: { c: 0, m: 7, y: 100, k: 0 },
      category: 'Yellow'
    },
    {
      code: '109',
      name: 'Pantone 109',
      displayName: 'P 109',
      hex: '#FFD100',
      rgb: { r: 255, g: 209, b: 0 },
      cmyk: { c: 0, m: 18, y: 100, k: 0 },
      category: 'Yellow'
    },
    {
      code: '012',
      name: 'Pantone 012',
      displayName: 'P 012',
      hex: '#FFF200',
      rgb: { r: 255, g: 242, b: 0 },
      cmyk: { c: 0, m: 5, y: 100, k: 0 },
      category: 'Yellow'
    },

    // NARANJAS
    {
      code: '021',
      name: 'Pantone 021',
      displayName: 'P 021',
      hex: '#FF5800',
      rgb: { r: 255, g: 88, b: 0 },
      cmyk: { c: 0, m: 65, y: 100, k: 0 },
      category: 'Orange'
    },
    {
      code: '165',
      name: 'Pantone 165',
      displayName: 'P 165',
      hex: '#FF6900',
      rgb: { r: 255, g: 105, b: 0 },
      cmyk: { c: 0, m: 59, y: 100, k: 0 },
      category: 'Orange'
    },
    {
      code: '1375',
      name: 'Pantone 1375',
      displayName: 'P 1375',
      hex: '#FF8200',
      rgb: { r: 255, g: 130, b: 0 },
      cmyk: { c: 0, m: 49, y: 100, k: 0 },
      category: 'Orange'
    },

    // PÚRPURAS/VIOLETAS
    {
      code: '2685',
      name: 'Pantone 2685',
      displayName: 'P 2685',
      hex: '#663399',
      rgb: { r: 102, g: 51, b: 153 },
      cmyk: { c: 33, m: 67, y: 0, k: 40 },
      category: 'Purple'
    },
    {
      code: '2593',
      name: 'Pantone 2593',
      displayName: 'P 2593',
      hex: '#8B5A96',
      rgb: { r: 139, g: 90, b: 150 },
      cmyk: { c: 7, m: 40, y: 0, k: 41 },
      category: 'Purple'
    },

    // GRISES Y NEGROS
    {
      code: 'Black',
      name: 'Pantone Black',
      displayName: 'P Black',
      hex: '#000000',
      rgb: { r: 0, g: 0, b: 0 },
      cmyk: { c: 0, m: 0, y: 0, k: 100 },
      category: 'Black'
    },
    {
      code: '425',
      name: 'Pantone 425',
      displayName: 'P 425',
      hex: '#54585A',
      rgb: { r: 84, g: 88, b: 90 },
      cmyk: { c: 7, m: 2, y: 0, k: 65 },
      category: 'Gray'
    },
    {
      code: '430',
      name: 'Pantone 430',
      displayName: 'P 430',
      hex: '#7C878E',
      rgb: { r: 124, g: 135, b: 142 },
      cmyk: { c: 13, m: 5, y: 0, k: 44 },
      category: 'Gray'
    },

    // BLANCOS
    {
      code: 'White',
      name: 'Pantone White',
      displayName: 'P White',
      hex: '#FFFFFF',
      rgb: { r: 255, g: 255, b: 255 },
      cmyk: { c: 0, m: 0, y: 0, k: 0 },
      category: 'White'
    },

    // COLORES METÁLICOS
    {
      code: '871',
      name: 'Pantone 871',
      displayName: 'P 871 (Gold)',
      hex: '#B8860B',
      rgb: { r: 184, g: 134, b: 11 },
      cmyk: { c: 0, m: 27, y: 94, k: 28 },
      category: 'Metallic'
    },
    {
      code: '877',
      name: 'Pantone 877',
      displayName: 'P 877 (Silver)',
      hex: '#C0C0C0',
      rgb: { r: 192, g: 192, b: 192 },
      cmyk: { c: 0, m: 0, y: 0, k: 25 },
      category: 'Metallic'
    }
  ];

  constructor() {}

  /**
   * Obtener todos los colores Pantone disponibles
   */
  getAllColors(): PantoneColor[] {
    return this.pantoneColors;
  }

  /**
   * Buscar colores por código
   */
  searchByCode(searchTerm: string): PantoneColor[] {
    const term = searchTerm.toLowerCase();
    return this.pantoneColors.filter(color => 
      color.code.toLowerCase().includes(term) ||
      color.displayName.toLowerCase().includes(term)
    );
  }

  /**
   * Obtener colores por categoría
   */
  getColorsByCategory(category: string): PantoneColor[] {
    return this.pantoneColors.filter(color => color.category === category);
  }

  /**
   * Obtener todas las categorías disponibles
   */
  getCategories(): string[] {
    const categories = [...new Set(this.pantoneColors.map(color => color.category))];
    return categories.sort();
  }

  /**
   * Obtener un color específico por código
   */
  getColorByCode(code: string): PantoneColor | undefined {
    return this.pantoneColors.find(color => 
      color.code.toLowerCase() === code.toLowerCase()
    );
  }

  /**
   * Obtener colores más utilizados en flexografía
   */
  getMostUsedColors(): PantoneColor[] {
    const mostUsedCodes = ['Black', 'White', '186', '286', '348', '116', '021', '209'];
    return this.pantoneColors.filter(color => mostUsedCodes.includes(color.code));
  }

  /**
   * Convertir lista de códigos a colores completos
   */
  getColorsByCodes(codes: string[]): PantoneColor[] {
    return codes.map(code => this.getColorByCode(code))
                .filter(color => color !== undefined) as PantoneColor[];
  }

  /**
   * Formatear color para mostrar en UI
   */
  formatColorForDisplay(color: PantoneColor): string {
    return `${color.displayName} - ${color.hex}`;
  }
}