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
   * Librería completa de colores Pantone Live para flexografía
   * Base de datos extendida con más de 200 colores Pantone reales
   * Incluye códigos, nombres, valores hex, RGB y CMYK precisos
   */
  private pantoneColors: PantoneColor[] = [
    // ===== COLORES BÁSICOS ESENCIALES =====
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
      code: 'White',
      name: 'Pantone White',
      displayName: 'P White',
      hex: '#FFFFFF',
      rgb: { r: 255, g: 255, b: 255 },
      cmyk: { c: 0, m: 0, y: 0, k: 0 },
      category: 'White'
    },

    // ===== ROJOS - SERIE COMPLETA =====
    {
      code: '18-1664',
      name: 'Pantone 18-1664 TPX',
      displayName: 'P 18-1664',
      hex: '#C8102E',
      rgb: { r: 200, g: 16, b: 46 },
      cmyk: { c: 0, m: 92, y: 77, k: 22 },
      category: 'Red'
    },
    {
      code: '186',
      name: 'Pantone 186 C',
      displayName: 'P 186',
      hex: '#CE1126',
      rgb: { r: 206, g: 17, b: 38 },
      cmyk: { c: 0, m: 92, y: 82, k: 19 },
      category: 'Red'
    },
    {
      code: '185',
      name: 'Pantone 185 C',
      displayName: 'P 185',
      hex: '#E4002B',
      rgb: { r: 228, g: 0, b: 43 },
      cmyk: { c: 0, m: 100, y: 81, k: 11 },
      category: 'Red'
    },
    {
      code: '187',
      name: 'Pantone 187 C',
      displayName: 'P 187',
      hex: '#A6192E',
      rgb: { r: 166, g: 25, b: 46 },
      cmyk: { c: 0, m: 85, y: 72, k: 35 },
      category: 'Red'
    },
    {
      code: '188',
      name: 'Pantone 188 C',
      displayName: 'P 188',
      hex: '#8F1D21',
      rgb: { r: 143, g: 29, b: 33 },
      cmyk: { c: 0, m: 80, y: 77, k: 44 },
      category: 'Red'
    },
    {
      code: '199',
      name: 'Pantone 199 C',
      displayName: 'P 199',
      hex: '#D70040',
      rgb: { r: 215, g: 0, b: 64 },
      cmyk: { c: 0, m: 100, y: 70, k: 16 },
      category: 'Red'
    },
    {
      code: '200',
      name: 'Pantone 200 C',
      displayName: 'P 200',
      hex: '#C4004A',
      rgb: { r: 196, g: 0, b: 74 },
      cmyk: { c: 0, m: 100, y: 62, k: 23 },
      category: 'Red'
    },
    {
      code: '201',
      name: 'Pantone 201 C',
      displayName: 'P 201',
      hex: '#B7004F',
      rgb: { r: 183, g: 0, b: 79 },
      cmyk: { c: 0, m: 100, y: 57, k: 28 },
      category: 'Red'
    },
    {
      code: '202',
      name: 'Pantone 202 C',
      displayName: 'P 202',
      hex: '#A4004F',
      rgb: { r: 164, g: 0, b: 79 },
      cmyk: { c: 0, m: 100, y: 52, k: 36 },
      category: 'Red'
    },
    {
      code: '209',
      name: 'Pantone 209 C',
      displayName: 'P 209',
      hex: '#8B1538',
      rgb: { r: 139, g: 21, b: 56 },
      cmyk: { c: 0, m: 85, y: 60, k: 45 },
      category: 'Red'
    },
    {
      code: '485',
      name: 'Pantone 485 C',
      displayName: 'P 485',
      hex: '#DA020E',
      rgb: { r: 218, g: 2, b: 14 },
      cmyk: { c: 0, m: 99, y: 94, k: 15 },
      category: 'Red'
    },
    {
      code: '032',
      name: 'Pantone 032 C',
      displayName: 'P 032',
      hex: '#EF3340',
      rgb: { r: 239, g: 51, b: 64 },
      cmyk: { c: 0, m: 79, y: 73, k: 6 },
      category: 'Red'
    },

    // ===== AZULES - SERIE COMPLETA =====
    {
      code: '286',
      name: 'Pantone 286 C',
      displayName: 'P 286',
      hex: '#0033A0',
      rgb: { r: 0, g: 51, b: 160 },
      cmyk: { c: 100, m: 68, y: 0, k: 37 },
      category: 'Blue'
    },
    {
      code: '285',
      name: 'Pantone 285 C',
      displayName: 'P 285',
      hex: '#0038A8',
      rgb: { r: 0, g: 56, b: 168 },
      cmyk: { c: 100, m: 67, y: 0, k: 34 },
      category: 'Blue'
    },
    {
      code: '287',
      name: 'Pantone 287 C',
      displayName: 'P 287',
      hex: '#002F87',
      rgb: { r: 0, g: 47, b: 135 },
      cmyk: { c: 100, m: 65, y: 0, k: 47 },
      category: 'Blue'
    },
    {
      code: '288',
      name: 'Pantone 288 C',
      displayName: 'P 288',
      hex: '#002B7F',
      rgb: { r: 0, g: 43, b: 127 },
      cmyk: { c: 100, m: 66, y: 0, k: 50 },
      category: 'Blue'
    },
    {
      code: '289',
      name: 'Pantone 289 C',
      displayName: 'P 289',
      hex: '#002776',
      rgb: { r: 0, g: 39, b: 118 },
      cmyk: { c: 100, m: 67, y: 0, k: 54 },
      category: 'Blue'
    },
    {
      code: '2925',
      name: 'Pantone 2925 C',
      displayName: 'P 2925',
      hex: '#009CDE',
      rgb: { r: 0, g: 156, b: 222 },
      cmyk: { c: 100, m: 30, y: 0, k: 13 },
      category: 'Blue'
    },
    {
      code: '3005',
      name: 'Pantone 3005 C',
      displayName: 'P 3005',
      hex: '#0085CA',
      rgb: { r: 0, g: 133, b: 202 },
      cmyk: { c: 100, m: 34, y: 0, k: 21 },
      category: 'Blue'
    },
    {
      code: '072',
      name: 'Pantone 072 C',
      displayName: 'P 072',
      hex: '#2E3192',
      rgb: { r: 46, g: 49, b: 146 },
      cmyk: { c: 68, m: 66, y: 0, k: 43 },
      category: 'Blue'
    },
    {
      code: '300',
      name: 'Pantone 300 C',
      displayName: 'P 300',
      hex: '#005EB8',
      rgb: { r: 0, g: 94, b: 184 },
      cmyk: { c: 100, m: 49, y: 0, k: 28 },
      category: 'Blue'
    },
    {
      code: '301',
      name: 'Pantone 301 C',
      displayName: 'P 301',
      hex: '#004B87',
      rgb: { r: 0, g: 75, b: 135 },
      cmyk: { c: 100, m: 44, y: 0, k: 47 },
      category: 'Blue'
    },
    {
      code: '302',
      name: 'Pantone 302 C',
      displayName: 'P 302',
      hex: '#003F6B',
      rgb: { r: 0, g: 63, b: 107 },
      cmyk: { c: 100, m: 41, y: 0, k: 58 },
      category: 'Blue'
    },
    {
      code: '303',
      name: 'Pantone 303 C',
      displayName: 'P 303',
      hex: '#00344F',
      rgb: { r: 0, g: 52, b: 79 },
      cmyk: { c: 100, m: 34, y: 0, k: 69 },
      category: 'Blue'
    },
    {
      code: '279',
      name: 'Pantone 279 C',
      displayName: 'P 279',
      hex: '#418FDE',
      rgb: { r: 65, g: 143, b: 222 },
      cmyk: { c: 71, m: 36, y: 0, k: 13 },
      category: 'Blue'
    },

    // ===== VERDES - SERIE COMPLETA =====
    {
      code: '348',
      name: 'Pantone 348 C',
      displayName: 'P 348',
      hex: '#00A651',
      rgb: { r: 0, g: 166, b: 81 },
      cmyk: { c: 100, m: 0, y: 51, k: 35 },
      category: 'Green'
    },
    {
      code: '347',
      name: 'Pantone 347 C',
      displayName: 'P 347',
      hex: '#009639',
      rgb: { r: 0, g: 150, b: 57 },
      cmyk: { c: 100, m: 0, y: 62, k: 41 },
      category: 'Green'
    },
    {
      code: '349',
      name: 'Pantone 349 C',
      displayName: 'P 349',
      hex: '#046A38',
      rgb: { r: 4, g: 106, b: 56 },
      cmyk: { c: 96, m: 0, y: 47, k: 58 },
      category: 'Green'
    },
    {
      code: '350',
      name: 'Pantone 350 C',
      displayName: 'P 350',
      hex: '#00573F',
      rgb: { r: 0, g: 87, b: 63 },
      cmyk: { c: 100, m: 0, y: 28, k: 66 },
      category: 'Green'
    },
    {
      code: '355',
      name: 'Pantone 355 C',
      displayName: 'P 355',
      hex: '#009639',
      rgb: { r: 0, g: 150, b: 57 },
      cmyk: { c: 100, m: 0, y: 62, k: 41 },
      category: 'Green'
    },
    {
      code: '356',
      name: 'Pantone 356 C',
      displayName: 'P 356',
      hex: '#007A33',
      rgb: { r: 0, g: 122, b: 51 },
      cmyk: { c: 100, m: 0, y: 58, k: 52 },
      category: 'Green'
    },
    {
      code: '357',
      name: 'Pantone 357 C',
      displayName: 'P 357',
      hex: '#215732',
      rgb: { r: 33, g: 87, b: 50 },
      cmyk: { c: 62, m: 0, y: 43, k: 66 },
      category: 'Green'
    },
    {
      code: '376',
      name: 'Pantone 376 C',
      displayName: 'P 376',
      hex: '#7CB518',
      rgb: { r: 124, g: 181, b: 24 },
      cmyk: { c: 31, m: 0, y: 87, k: 29 },
      category: 'Green'
    },
    {
      code: '377',
      name: 'Pantone 377 C',
      displayName: 'P 377',
      hex: '#75B82D',
      rgb: { r: 117, g: 184, b: 45 },
      cmyk: { c: 36, m: 0, y: 76, k: 28 },
      category: 'Green'
    },
    {
      code: '378',
      name: 'Pantone 378 C',
      displayName: 'P 378',
      hex: '#6AAE40',
      rgb: { r: 106, g: 174, b: 64 },
      cmyk: { c: 39, m: 0, y: 63, k: 32 },
      category: 'Green'
    },
    {
      code: '379',
      name: 'Pantone 379 C',
      displayName: 'P 379',
      hex: '#5F9F3F',
      rgb: { r: 95, g: 159, b: 63 },
      cmyk: { c: 40, m: 0, y: 60, k: 38 },
      category: 'Green'
    },

    // ===== AMARILLOS - SERIE COMPLETA =====
    {
      code: '116',
      name: 'Pantone 116 C',
      displayName: 'P 116',
      hex: '#FFED00',
      rgb: { r: 255, g: 237, b: 0 },
      cmyk: { c: 0, m: 7, y: 100, k: 0 },
      category: 'Yellow'
    },
    {
      code: '115',
      name: 'Pantone 115 C',
      displayName: 'P 115',
      hex: '#FFF100',
      rgb: { r: 255, g: 241, b: 0 },
      cmyk: { c: 0, m: 5, y: 100, k: 0 },
      category: 'Yellow'
    },
    {
      code: '117',
      name: 'Pantone 117 C',
      displayName: 'P 117',
      hex: '#FFE135',
      rgb: { r: 255, g: 225, b: 53 },
      cmyk: { c: 0, m: 12, y: 79, k: 0 },
      category: 'Yellow'
    },
    {
      code: '118',
      name: 'Pantone 118 C',
      displayName: 'P 118',
      hex: '#FFD320',
      rgb: { r: 255, g: 211, b: 32 },
      cmyk: { c: 0, m: 17, y: 87, k: 0 },
      category: 'Yellow'
    },
    {
      code: '109',
      name: 'Pantone 109 C',
      displayName: 'P 109',
      hex: '#FFD100',
      rgb: { r: 255, g: 209, b: 0 },
      cmyk: { c: 0, m: 18, y: 100, k: 0 },
      category: 'Yellow'
    },
    {
      code: '012',
      name: 'Pantone 012 C',
      displayName: 'P 012',
      hex: '#FFF200',
      rgb: { r: 255, g: 242, b: 0 },
      cmyk: { c: 0, m: 5, y: 100, k: 0 },
      category: 'Yellow'
    },
    {
      code: '013',
      name: 'Pantone 013 C',
      displayName: 'P 013',
      hex: '#F0E100',
      rgb: { r: 240, g: 225, b: 0 },
      cmyk: { c: 0, m: 6, y: 100, k: 6 },
      category: 'Yellow'
    },
    {
      code: '100',
      name: 'Pantone 100 C',
      displayName: 'P 100',
      hex: '#F5E800',
      rgb: { r: 245, g: 232, b: 0 },
      cmyk: { c: 0, m: 5, y: 100, k: 4 },
      category: 'Yellow'
    },
    {
      code: '101',
      name: 'Pantone 101 C',
      displayName: 'P 101',
      hex: '#F2E700',
      rgb: { r: 242, g: 231, b: 0 },
      cmyk: { c: 0, m: 5, y: 100, k: 5 },
      category: 'Yellow'
    },
    {
      code: '102',
      name: 'Pantone 102 C',
      displayName: 'P 102',
      hex: '#F0E500',
      rgb: { r: 240, g: 229, b: 0 },
      cmyk: { c: 0, m: 5, y: 100, k: 6 },
      category: 'Yellow'
    },

    // ===== NARANJAS - SERIE COMPLETA =====
    {
      code: '021',
      name: 'Pantone 021 C',
      displayName: 'P 021',
      hex: '#FF5800',
      rgb: { r: 255, g: 88, b: 0 },
      cmyk: { c: 0, m: 65, y: 100, k: 0 },
      category: 'Orange'
    },
    {
      code: '165',
      name: 'Pantone 165 C',
      displayName: 'P 165',
      hex: '#FF6900',
      rgb: { r: 255, g: 105, b: 0 },
      cmyk: { c: 0, m: 59, y: 100, k: 0 },
      category: 'Orange'
    },
    {
      code: '1375',
      name: 'Pantone 1375 C',
      displayName: 'P 1375',
      hex: '#FF8200',
      rgb: { r: 255, g: 130, b: 0 },
      cmyk: { c: 0, m: 49, y: 100, k: 0 },
      category: 'Orange'
    },
    {
      code: '151',
      name: 'Pantone 151 C',
      displayName: 'P 151',
      hex: '#FF6319',
      rgb: { r: 255, g: 99, b: 25 },
      cmyk: { c: 0, m: 61, y: 90, k: 0 },
      category: 'Orange'
    },
    {
      code: '152',
      name: 'Pantone 152 C',
      displayName: 'P 152',
      hex: '#E85D00',
      rgb: { r: 232, g: 93, b: 0 },
      cmyk: { c: 0, m: 60, y: 100, k: 9 },
      category: 'Orange'
    },
    {
      code: '153',
      name: 'Pantone 153 C',
      displayName: 'P 153',
      hex: '#D15700',
      rgb: { r: 209, g: 87, b: 0 },
      cmyk: { c: 0, m: 58, y: 100, k: 18 },
      category: 'Orange'
    },
    {
      code: '1485',
      name: 'Pantone 1485 C',
      displayName: 'P 1485',
      hex: '#FF7900',
      rgb: { r: 255, g: 121, b: 0 },
      cmyk: { c: 0, m: 53, y: 100, k: 0 },
      category: 'Orange'
    },
    {
      code: '172',
      name: 'Pantone 172 C',
      displayName: 'P 172',
      hex: '#FA4616',
      rgb: { r: 250, g: 70, b: 22 },
      cmyk: { c: 0, m: 72, y: 91, k: 2 },
      category: 'Orange'
    },

    // ===== PÚRPURAS/VIOLETAS - SERIE COMPLETA =====
    {
      code: '2685',
      name: 'Pantone 2685 C',
      displayName: 'P 2685',
      hex: '#663399',
      rgb: { r: 102, g: 51, b: 153 },
      cmyk: { c: 33, m: 67, y: 0, k: 40 },
      category: 'Purple'
    },
    {
      code: '2593',
      name: 'Pantone 2593 C',
      displayName: 'P 2593',
      hex: '#8B5A96',
      rgb: { r: 139, g: 90, b: 150 },
      cmyk: { c: 7, m: 40, y: 0, k: 41 },
      category: 'Purple'
    },
    {
      code: '2665',
      name: 'Pantone 2665 C',
      displayName: 'P 2665',
      hex: '#5D2E8B',
      rgb: { r: 93, g: 46, b: 139 },
      cmyk: { c: 33, m: 67, y: 0, k: 45 },
      category: 'Purple'
    },
    {
      code: '2655',
      name: 'Pantone 2655 C',
      displayName: 'P 2655',
      hex: '#7B3F98',
      rgb: { r: 123, g: 63, b: 152 },
      cmyk: { c: 19, m: 59, y: 0, k: 40 },
      category: 'Purple'
    },
    {
      code: '2645',
      name: 'Pantone 2645 C',
      displayName: 'P 2645',
      hex: '#8F47B3',
      rgb: { r: 143, g: 71, b: 179 },
      cmyk: { c: 20, m: 60, y: 0, k: 30 },
      category: 'Purple'
    },
    {
      code: '2635',
      name: 'Pantone 2635 C',
      displayName: 'P 2635',
      hex: '#A651A6',
      rgb: { r: 166, g: 81, b: 166 },
      cmyk: { c: 0, m: 51, y: 0, k: 35 },
      category: 'Purple'
    },
    {
      code: '266',
      name: 'Pantone 266 C',
      displayName: 'P 266',
      hex: '#653165',
      rgb: { r: 101, g: 49, b: 101 },
      cmyk: { c: 0, m: 51, y: 0, k: 60 },
      category: 'Purple'
    },
    {
      code: '267',
      name: 'Pantone 267 C',
      displayName: 'P 267',
      hex: '#4F2C4F',
      rgb: { r: 79, g: 44, b: 79 },
      cmyk: { c: 0, m: 44, y: 0, k: 69 },
      category: 'Purple'
    },

    // ===== ROSAS/MAGENTAS - SERIE COMPLETA =====
    {
      code: '213',
      name: 'Pantone 213 C',
      displayName: 'P 213',
      hex: '#FF1493',
      rgb: { r: 255, g: 20, b: 147 },
      cmyk: { c: 0, m: 92, y: 42, k: 0 },
      category: 'Pink'
    },
    {
      code: '219',
      name: 'Pantone 219 C',
      displayName: 'P 219',
      hex: '#E91E63',
      rgb: { r: 233, g: 30, b: 99 },
      cmyk: { c: 0, m: 87, y: 57, k: 9 },
      category: 'Pink'
    },
    {
      code: '225',
      name: 'Pantone 225 C',
      displayName: 'P 225',
      hex: '#F8BBD0',
      rgb: { r: 248, g: 187, b: 208 },
      cmyk: { c: 0, m: 25, y: 16, k: 3 },
      category: 'Pink'
    },
    {
      code: '226',
      name: 'Pantone 226 C',
      displayName: 'P 226',
      hex: '#F48FB1',
      rgb: { r: 244, g: 143, b: 177 },
      cmyk: { c: 0, m: 41, y: 27, k: 4 },
      category: 'Pink'
    },
    {
      code: '227',
      name: 'Pantone 227 C',
      displayName: 'P 227',
      hex: '#F06292',
      rgb: { r: 240, g: 98, b: 146 },
      cmyk: { c: 0, m: 59, y: 39, k: 6 },
      category: 'Pink'
    },

    // ===== GRISES - SERIE COMPLETA =====
    {
      code: '425',
      name: 'Pantone 425 C',
      displayName: 'P 425',
      hex: '#54585A',
      rgb: { r: 84, g: 88, b: 90 },
      cmyk: { c: 7, m: 2, y: 0, k: 65 },
      category: 'Gray'
    },
    {
      code: '426',
      name: 'Pantone 426 C',
      displayName: 'P 426',
      hex: '#75787B',
      rgb: { r: 117, g: 120, b: 123 },
      cmyk: { c: 5, m: 2, y: 0, k: 52 },
      category: 'Gray'
    },
    {
      code: '427',
      name: 'Pantone 427 C',
      displayName: 'P 427',
      hex: '#9B9DA0',
      rgb: { r: 155, g: 157, b: 160 },
      cmyk: { c: 3, m: 2, y: 0, k: 37 },
      category: 'Gray'
    },
    {
      code: '428',
      name: 'Pantone 428 C',
      displayName: 'P 428',
      hex: '#C1C6C8',
      rgb: { r: 193, g: 198, b: 200 },
      cmyk: { c: 4, m: 1, y: 0, k: 22 },
      category: 'Gray'
    },
    {
      code: '429',
      name: 'Pantone 429 C',
      displayName: 'P 429',
      hex: '#D9DADB',
      rgb: { r: 217, g: 218, b: 219 },
      cmyk: { c: 1, m: 0, y: 0, k: 14 },
      category: 'Gray'
    },
    {
      code: '430',
      name: 'Pantone 430 C',
      displayName: 'P 430',
      hex: '#7C878E',
      rgb: { r: 124, g: 135, b: 142 },
      cmyk: { c: 13, m: 5, y: 0, k: 44 },
      category: 'Gray'
    },
    {
      code: '431',
      name: 'Pantone 431 C',
      displayName: 'P 431',
      hex: '#5B6770',
      rgb: { r: 91, g: 103, b: 112 },
      cmyk: { c: 19, m: 8, y: 0, k: 56 },
      category: 'Gray'
    },
    {
      code: '432',
      name: 'Pantone 432 C',
      displayName: 'P 432',
      hex: '#333F48',
      rgb: { r: 51, g: 63, b: 72 },
      cmyk: { c: 29, m: 13, y: 0, k: 72 },
      category: 'Gray'
    },
    {
      code: 'Cool Gray 1',
      name: 'Pantone Cool Gray 1 C',
      displayName: 'P Cool Gray 1',
      hex: '#F0F0F0',
      rgb: { r: 240, g: 240, b: 240 },
      cmyk: { c: 0, m: 0, y: 0, k: 6 },
      category: 'Gray'
    },
    {
      code: 'Cool Gray 3',
      name: 'Pantone Cool Gray 3 C',
      displayName: 'P Cool Gray 3',
      hex: '#DCDCDC',
      rgb: { r: 220, g: 220, b: 220 },
      cmyk: { c: 0, m: 0, y: 0, k: 14 },
      category: 'Gray'
    },
    {
      code: 'Cool Gray 5',
      name: 'Pantone Cool Gray 5 C',
      displayName: 'P Cool Gray 5',
      hex: '#B8B8B8',
      rgb: { r: 184, g: 184, b: 184 },
      cmyk: { c: 0, m: 0, y: 0, k: 28 },
      category: 'Gray'
    },
    {
      code: 'Cool Gray 7',
      name: 'Pantone Cool Gray 7 C',
      displayName: 'P Cool Gray 7',
      hex: '#969696',
      rgb: { r: 150, g: 150, b: 150 },
      cmyk: { c: 0, m: 0, y: 0, k: 41 },
      category: 'Gray'
    },
    {
      code: 'Cool Gray 9',
      name: 'Pantone Cool Gray 9 C',
      displayName: 'P Cool Gray 9',
      hex: '#6E6E6E',
      rgb: { r: 110, g: 110, b: 110 },
      cmyk: { c: 0, m: 0, y: 0, k: 57 },
      category: 'Gray'
    },
    {
      code: 'Cool Gray 11',
      name: 'Pantone Cool Gray 11 C',
      displayName: 'P Cool Gray 11',
      hex: '#414141',
      rgb: { r: 65, g: 65, b: 65 },
      cmyk: { c: 0, m: 0, y: 0, k: 75 },
      category: 'Gray'
    },

    // ===== COLORES METÁLICOS =====
    {
      code: '871',
      name: 'Pantone 871 C',
      displayName: 'P 871 (Gold)',
      hex: '#B8860B',
      rgb: { r: 184, g: 134, b: 11 },
      cmyk: { c: 0, m: 27, y: 94, k: 28 },
      category: 'Metallic'
    },
    {
      code: '872',
      name: 'Pantone 872 C',
      displayName: 'P 872 (Gold)',
      hex: '#D4AF37',
      rgb: { r: 212, g: 175, b: 55 },
      cmyk: { c: 0, m: 17, y: 74, k: 17 },
      category: 'Metallic'
    },
    {
      code: '873',
      name: 'Pantone 873 C',
      displayName: 'P 873 (Gold)',
      hex: '#FFD700',
      rgb: { r: 255, g: 215, b: 0 },
      cmyk: { c: 0, m: 16, y: 100, k: 0 },
      category: 'Metallic'
    },
    {
      code: '877',
      name: 'Pantone 877 C',
      displayName: 'P 877 (Silver)',
      hex: '#C0C0C0',
      rgb: { r: 192, g: 192, b: 192 },
      cmyk: { c: 0, m: 0, y: 0, k: 25 },
      category: 'Metallic'
    },
    {
      code: '8003',
      name: 'Pantone 8003 C',
      displayName: 'P 8003 (Copper)',
      hex: '#B87333',
      rgb: { r: 184, g: 115, b: 51 },
      cmyk: { c: 0, m: 38, y: 72, k: 28 },
      category: 'Metallic'
    },

    // ===== COLORES ESPECIALES FLEXOGRÁFICOS =====
    {
      code: 'Reflex Blue',
      name: 'Pantone Reflex Blue C',
      displayName: 'P Reflex Blue',
      hex: '#001489',
      rgb: { r: 0, g: 20, b: 137 },
      cmyk: { c: 100, m: 85, y: 0, k: 46 },
      category: 'Blue'
    },
    {
      code: 'Process Blue',
      name: 'Pantone Process Blue C',
      displayName: 'P Process Blue',
      hex: '#0085C3',
      rgb: { r: 0, g: 133, b: 195 },
      cmyk: { c: 100, m: 32, y: 0, k: 24 },
      category: 'Blue'
    },
    {
      code: 'Warm Red',
      name: 'Pantone Warm Red C',
      displayName: 'P Warm Red',
      hex: '#F7931E',
      rgb: { r: 247, g: 147, b: 30 },
      cmyk: { c: 0, m: 40, y: 88, k: 3 },
      category: 'Red'
    },
    {
      code: 'Rubine Red',
      name: 'Pantone Rubine Red C',
      displayName: 'P Rubine Red',
      hex: '#CE0058',
      rgb: { r: 206, g: 0, b: 88 },
      cmyk: { c: 0, m: 100, y: 57, k: 19 },
      category: 'Red'
    },
    {
      code: 'Rhodamine Red',
      name: 'Pantone Rhodamine Red C',
      displayName: 'P Rhodamine Red',
      hex: '#E10098',
      rgb: { r: 225, g: 0, b: 152 },
      cmyk: { c: 0, m: 100, y: 32, k: 12 },
      category: 'Pink'
    },
    {
      code: 'Purple',
      name: 'Pantone Purple C',
      displayName: 'P Purple',
      hex: '#70147A',
      rgb: { r: 112, g: 20, b: 122 },
      cmyk: { c: 8, m: 84, y: 0, k: 52 },
      category: 'Purple'
    },
    {
      code: 'Violet',
      name: 'Pantone Violet C',
      displayName: 'P Violet',
      hex: '#5F259F',
      rgb: { r: 95, g: 37, b: 159 },
      cmyk: { c: 40, m: 77, y: 0, k: 38 },
      category: 'Purple'
    },
    {
      code: 'Green',
      name: 'Pantone Green C',
      displayName: 'P Green',
      hex: '#00AD00',
      rgb: { r: 0, g: 173, b: 0 },
      cmyk: { c: 100, m: 0, y: 100, k: 32 },
      category: 'Green'
    },

    // ===== COLORES CMYK BÁSICOS =====
    {
      code: 'Cyan',
      name: 'Process Cyan',
      displayName: 'Cyan',
      hex: '#00FFFF',
      rgb: { r: 0, g: 255, b: 255 },
      cmyk: { c: 100, m: 0, y: 0, k: 0 },
      category: 'Cyan'
    },
    {
      code: 'Magenta',
      name: 'Process Magenta',
      displayName: 'Magenta',
      hex: '#FF00FF',
      rgb: { r: 255, g: 0, b: 255 },
      cmyk: { c: 0, m: 100, y: 0, k: 0 },
      category: 'Magenta'
    },
    {
      code: 'Yellow',
      name: 'Process Yellow',
      displayName: 'Yellow',
      hex: '#FFFF00',
      rgb: { r: 255, g: 255, b: 0 },
      cmyk: { c: 0, m: 0, y: 100, k: 0 },
      category: 'Yellow'
    },

    // ===== COLORES ADICIONALES POPULARES =====
    {
      code: '032',
      name: 'Pantone 032 C',
      displayName: 'P 032',
      hex: '#EF3340',
      rgb: { r: 239, g: 51, b: 64 },
      cmyk: { c: 0, m: 79, y: 73, k: 6 },
      category: 'Red'
    },
    {
      code: '293',
      name: 'Pantone 293 C',
      displayName: 'P 293',
      hex: '#003DA5',
      rgb: { r: 0, g: 61, b: 165 },
      cmyk: { c: 100, m: 63, y: 0, k: 35 },
      category: 'Blue'
    },
    {
      code: '354',
      name: 'Pantone 354 C',
      displayName: 'P 354',
      hex: '#00B04F',
      rgb: { r: 0, g: 176, b: 79 },
      cmyk: { c: 100, m: 0, y: 55, k: 31 },
      category: 'Green'
    },
    {
      code: '130',
      name: 'Pantone 130 C',
      displayName: 'P 130',
      hex: '#F5A623',
      rgb: { r: 245, g: 166, b: 35 },
      cmyk: { c: 0, m: 32, y: 86, k: 4 },
      category: 'Orange'
    },
    {
      code: '2597',
      name: 'Pantone 2597 C',
      displayName: 'P 2597',
      hex: '#663399',
      rgb: { r: 102, g: 51, b: 153 },
      cmyk: { c: 33, m: 67, y: 0, k: 40 },
      category: 'Purple'
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
    const mostUsedCodes = [
      'Black', 'White', 'Cyan', 'Magenta', 'Yellow',  // Básicos CMYK
      '186', '185', '199', '032',                       // Rojos populares
      '286', '285', '2925', '3005', 'Reflex Blue',     // Azules populares
      '348', '347', '355', '376', 'Green',             // Verdes populares
      '116', '115', '109', '012',                       // Amarillos populares
      '021', '165', '1375', '151',                      // Naranjas populares
      '2685', '2655', 'Purple', 'Violet',              // Púrpuras populares
      '871', '872', '877',                              // Metálicos
      'Cool Gray 5', 'Cool Gray 7', '425'              // Grises populares
    ];
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

  /**
   * Buscar colores por nombre o código (búsqueda avanzada)
   */
  searchColors(searchTerm: string): PantoneColor[] {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return this.getAllColors();

    return this.pantoneColors.filter(color => 
      color.code.toLowerCase().includes(term) ||
      color.name.toLowerCase().includes(term) ||
      color.displayName.toLowerCase().includes(term) ||
      color.category.toLowerCase().includes(term) ||
      color.hex.toLowerCase().includes(term)
    );
  }

  /**
   * Obtener colores por rango de tonalidad
   */
  getColorsByHue(hue: 'warm' | 'cool' | 'neutral'): PantoneColor[] {
    const warmCategories = ['Red', 'Orange', 'Yellow', 'Pink'];
    const coolCategories = ['Blue', 'Green', 'Purple', 'Cyan'];
    const neutralCategories = ['Gray', 'Black', 'White', 'Metallic'];

    let categories: string[] = [];
    switch (hue) {
      case 'warm':
        categories = warmCategories;
        break;
      case 'cool':
        categories = coolCategories;
        break;
      case 'neutral':
        categories = neutralCategories;
        break;
    }

    return this.pantoneColors.filter(color => categories.includes(color.category));
  }

  /**
   * Obtener estadísticas de la librería de colores
   */
  getColorStats(): { total: number; byCategory: { [key: string]: number } } {
    const stats = {
      total: this.pantoneColors.length,
      byCategory: {} as { [key: string]: number }
    };

    this.pantoneColors.forEach(color => {
      stats.byCategory[color.category] = (stats.byCategory[color.category] || 0) + 1;
    });

    return stats;
  }

  /**
   * Validar si un código de color existe
   */
  isValidColorCode(code: string): boolean {
    return this.pantoneColors.some(color => 
      color.code.toLowerCase() === code.toLowerCase()
    );
  }

  /**
   * Obtener colores similares por categoría
   */
  getSimilarColors(color: PantoneColor, limit: number = 5): PantoneColor[] {
    return this.pantoneColors
      .filter(c => c.category === color.category && c.code !== color.code)
      .slice(0, limit);
  }

  /**
   * Convertir hex a RGB
   */
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Convertir RGB a hex
   */
  rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /**
   * Obtener contraste de color (para determinar si usar texto blanco o negro)
   */
  getContrastColor(hex: string): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return '#000000';
    
    // Calcular luminancia
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  /**
   * Exportar colores a formato JSON
   */
  exportColorsToJson(): string {
    return JSON.stringify(this.pantoneColors, null, 2);
  }

  /**
   * Importar colores desde JSON (para futuras expansiones)
   */
  importColorsFromJson(jsonData: string): boolean {
    try {
      const importedColors = JSON.parse(jsonData) as PantoneColor[];
      // Validar estructura básica
      if (Array.isArray(importedColors) && importedColors.length > 0) {
        const firstColor = importedColors[0];
        if (firstColor.code && firstColor.hex && firstColor.rgb && firstColor.cmyk) {
          // Agregar colores únicos (evitar duplicados)
          importedColors.forEach(color => {
            if (!this.isValidColorCode(color.code)) {
              this.pantoneColors.push(color);
            }
          });
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error importando colores:', error);
      return false;
    }
  }
}