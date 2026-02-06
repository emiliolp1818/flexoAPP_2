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
 * ACTUALIZADO: Pantone Live 2024 con colores corregidos
 */
@Injectable({
  providedIn: 'root'
})
export class PantoneLiveService {

  /**
   * Librería de colores Pantone Live para flexografía
   * Incluye colores básicos y extensión de la guía Solid Coated 2024
   * CORREGIDO: P193 ahora muestra el rojo correcto (#BF0D3E)
   */
  private pantoneColors: PantoneColor[] = [
    // ===== COLORES BÁSICOS ESENCIALES (HEXACROMÍA) =====
    { code: 'Black', name: 'Pantone Black', displayName: 'Negro', hex: '#000000', rgb: { r: 0, g: 0, b: 0 }, cmyk: { c: 0, m: 0, y: 0, k: 100 }, category: 'Black' },
    { code: 'White', name: 'Pantone White', displayName: 'Blanco', hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, cmyk: { c: 0, m: 0, y: 0, k: 0 }, category: 'White' },
    { code: 'Cyan', name: 'Pantone Cyan', displayName: 'P Cyan', hex: '#00AEEF', rgb: { r: 0, g: 174, b: 239 }, cmyk: { c: 100, m: 0, y: 0, k: 0 }, category: 'Cyan' },
    { code: 'Magenta', name: 'Pantone Magenta', displayName: 'P Magenta', hex: '#EC008C', rgb: { r: 236, g: 0, b: 140 }, cmyk: { c: 0, m: 100, y: 0, k: 0 }, category: 'Pink' },
    { code: 'Yellow', name: 'Pantone Yellow', displayName: 'Amarillo', hex: '#FFF200', rgb: { r: 255, g: 242, b: 0 }, cmyk: { c: 0, m: 0, y: 100, k: 0 }, category: 'Yellow' },
    { code: 'Green', name: 'Pantone Green', displayName: 'Verde', hex: '#00A651', rgb: { r: 0, g: 166, b: 81 }, cmyk: { c: 100, m: 0, y: 51, k: 35 }, category: 'Green' },
    { code: 'Orange', name: 'Pantone Orange', displayName: 'Naranja', hex: '#FF6900', rgb: { r: 255, g: 105, b: 0 }, cmyk: { c: 0, m: 59, y: 100, k: 0 }, category: 'Orange' },
    { code: 'Violet', name: 'Pantone Violet', displayName: 'Violeta', hex: '#8B3F8F', rgb: { r: 139, g: 63, b: 143 }, cmyk: { c: 3, m: 56, y: 0, k: 44 }, category: 'Purple' },

    // ===== ROJOS (CORREGIDOS) =====
    { code: '185', name: 'Pantone 185 C', displayName: 'P 185', hex: '#E4002B', rgb: { r: 228, g: 0, b: 43 }, cmyk: { c: 0, m: 100, y: 81, k: 11 }, category: 'Red' },
    { code: '186', name: 'Pantone 186 C', displayName: 'P 186', hex: '#CE1126', rgb: { r: 206, g: 17, b: 38 }, cmyk: { c: 0, m: 92, y: 82, k: 19 }, category: 'Red' },
    { code: '187', name: 'Pantone 187 C', displayName: 'P 187', hex: '#A6192E', rgb: { r: 166, g: 25, b: 46 }, cmyk: { c: 0, m: 85, y: 72, k: 35 }, category: 'Red' },
    { code: '193', name: 'Pantone 193 C', displayName: 'P 193', hex: '#BF0D3E', rgb: { r: 191, g: 13, b: 62 }, cmyk: { c: 0, m: 93, y: 68, k: 25 }, category: 'Red' },
    { code: '194', name: 'Pantone 194 C', displayName: 'P 194', hex: '#A50034', rgb: { r: 165, g: 0, b: 52 }, cmyk: { c: 0, m: 100, y: 68, k: 35 }, category: 'Red' },
    { code: '195', name: 'Pantone 195 C', displayName: 'P 195', hex: '#8C002F', rgb: { r: 140, g: 0, b: 47 }, cmyk: { c: 0, m: 100, y: 66, k: 45 }, category: 'Red' },
    { code: '196', name: 'Pantone 196 C', displayName: 'P 196', hex: '#6F0029', rgb: { r: 111, g: 0, b: 41 }, cmyk: { c: 0, m: 100, y: 63, k: 56 }, category: 'Red' },
    { code: '197', name: 'Pantone 197 C', displayName: 'P 197', hex: '#5C0024', rgb: { r: 92, g: 0, b: 36 }, cmyk: { c: 0, m: 100, y: 61, k: 64 }, category: 'Red' },
    { code: '198', name: 'Pantone 198 C', displayName: 'P 198', hex: '#4A001F', rgb: { r: 74, g: 0, b: 31 }, cmyk: { c: 0, m: 100, y: 58, k: 71 }, category: 'Red' },
    { code: '199', name: 'Pantone 199 C', displayName: 'P 199', hex: '#3D001A', rgb: { r: 61, g: 0, b: 26 }, cmyk: { c: 0, m: 100, y: 57, k: 76 }, category: 'Red' },
    { code: '200', name: 'Pantone 200 C', displayName: 'P 200', hex: '#C4004A', rgb: { r: 196, g: 0, b: 74 }, cmyk: { c: 0, m: 100, y: 62, k: 23 }, category: 'Red' },
    { code: '201', name: 'Pantone 201 C', displayName: 'P 201', hex: '#9E003A', rgb: { r: 158, g: 0, b: 58 }, cmyk: { c: 0, m: 100, y: 63, k: 38 }, category: 'Red' },
    { code: '202', name: 'Pantone 202 C', displayName: 'P 202', hex: '#8A0034', rgb: { r: 138, g: 0, b: 52 }, cmyk: { c: 0, m: 100, y: 62, k: 46 }, category: 'Red' },
    { code: '485', name: 'Pantone 485 C', displayName: 'P 485', hex: '#DA020E', rgb: { r: 218, g: 2, b: 14 }, cmyk: { c: 0, m: 99, y: 94, k: 15 }, category: 'Red' },
    { code: '1788', name: 'Pantone 1788 C', displayName: 'P 1788', hex: '#EE2C2C', rgb: { r: 238, g: 44, b: 44 }, cmyk: { c: 0, m: 84, y: 77, k: 0 }, category: 'Red' },
    { code: '1795', name: 'Pantone 1795 C', displayName: 'P 1795', hex: '#D22630', rgb: { r: 210, g: 38, b: 48 }, cmyk: { c: 0, m: 82, y: 77, k: 18 }, category: 'Red' },
    { code: '1797', name: 'Pantone 1797 C', displayName: 'P 1797', hex: '#C8102E', rgb: { r: 200, g: 16, b: 46 }, cmyk: { c: 0, m: 92, y: 77, k: 22 }, category: 'Red' },
    { code: '1805', name: 'Pantone 1805 C', displayName: 'P 1805', hex: '#AF272F', rgb: { r: 175, g: 39, b: 47 }, cmyk: { c: 0, m: 78, y: 73, k: 31 }, category: 'Red' },

    // ===== ROSAS =====
    { code: '210', name: 'Pantone 210 C', displayName: 'P 210', hex: '#F9A7B0', rgb: { r: 249, g: 167, b: 176 }, cmyk: { c: 0, m: 42, y: 17, k: 0 }, category: 'Pink' },
    { code: '211', name: 'Pantone 211 C', displayName: 'P 211', hex: '#F69AB0', rgb: { r: 246, g: 154, b: 176 }, cmyk: { c: 0, m: 48, y: 20, k: 0 }, category: 'Pink' },
    { code: '212', name: 'Pantone 212 C', displayName: 'P 212', hex: '#F25278', rgb: { r: 242, g: 82, b: 120 }, cmyk: { c: 0, m: 73, y: 35, k: 0 }, category: 'Pink' },
    { code: '213', name: 'Pantone 213 C', displayName: 'P 213', hex: '#E31C79', rgb: { r: 227, g: 28, b: 121 }, cmyk: { c: 0, m: 88, y: 47, k: 11 }, category: 'Pink' },
    { code: '214', name: 'Pantone 214 C', displayName: 'P 214', hex: '#C6007E', rgb: { r: 198, g: 0, b: 126 }, cmyk: { c: 0, m: 100, y: 36, k: 22 }, category: 'Pink' },

    // ===== NARANJAS =====
    { code: '1345', name: 'Pantone 1345 C', displayName: 'P 1345', hex: '#FDD086', rgb: { r: 253, g: 208, b: 134 }, cmyk: { c: 0, m: 18, y: 47, k: 1 }, category: 'Orange' },
    { code: '1355', name: 'Pantone 1355 C', displayName: 'P 1355', hex: '#FFC56E', rgb: { r: 255, g: 197, b: 110 }, cmyk: { c: 0, m: 23, y: 57, k: 0 }, category: 'Orange' },
    { code: '1365', name: 'Pantone 1365 C', displayName: 'P 1365', hex: '#FFB549', rgb: { r: 255, g: 181, b: 73 }, cmyk: { c: 0, m: 29, y: 71, k: 0 }, category: 'Orange' },
    { code: '1375', name: 'Pantone 1375 C', displayName: 'P 1375', hex: '#FF9E1B', rgb: { r: 255, g: 158, b: 27 }, cmyk: { c: 0, m: 38, y: 89, k: 0 }, category: 'Orange' },
    { code: '1385', name: 'Pantone 1385 C', displayName: 'P 1385', hex: '#D57800', rgb: { r: 213, g: 120, b: 0 }, cmyk: { c: 0, m: 44, y: 100, k: 16 }, category: 'Orange' },
    { code: '1395', name: 'Pantone 1395 C', displayName: 'P 1395', hex: '#996017', rgb: { r: 153, g: 96, b: 23 }, cmyk: { c: 0, m: 37, y: 85, k: 40 }, category: 'Orange' },
    { code: '1505', name: 'Pantone 1505 C', displayName: 'P 1505', hex: '#FF6900', rgb: { r: 255, g: 105, b: 0 }, cmyk: { c: 0, m: 56, y: 90, k: 0 }, category: 'Orange' },
    { code: '021', name: 'Pantone 021 C', displayName: 'P 021', hex: '#FE5000', rgb: { r: 254, g: 80, b: 0 }, cmyk: { c: 0, m: 69, y: 100, k: 0 }, category: 'Orange' },
    { code: '1585', name: 'Pantone 1585 C', displayName: 'P 1585', hex: '#FF6A13', rgb: { r: 255, g: 106, b: 19 }, cmyk: { c: 0, m: 58, y: 93, k: 0 }, category: 'Orange' },
    { code: '1595', name: 'Pantone 1595 C', displayName: 'P 1595', hex: '#FF7F32', rgb: { r: 255, g: 127, b: 50 }, cmyk: { c: 0, m: 50, y: 80, k: 0 }, category: 'Orange' },
    { code: '165', name: 'Pantone 165 C', displayName: 'P 165', hex: '#FF6A39', rgb: { r: 255, g: 106, b: 57 }, cmyk: { c: 0, m: 58, y: 78, k: 0 }, category: 'Orange' },

    // ===== AMARILLOS =====
    { code: '100', name: 'Pantone 100 C', displayName: 'P 100', hex: '#F6EB61', rgb: { r: 246, g: 235, b: 97 }, cmyk: { c: 0, m: 0, y: 57, k: 0 }, category: 'Yellow' },
    { code: '101', name: 'Pantone 101 C', displayName: 'P 101', hex: '#F7EA48', rgb: { r: 247, g: 234, b: 72 }, cmyk: { c: 0, m: 0, y: 68, k: 0 }, category: 'Yellow' },
    { code: '102', name: 'Pantone 102 C', displayName: 'P 102', hex: '#FCE300', rgb: { r: 252, g: 227, b: 0 }, cmyk: { c: 0, m: 0, y: 95, k: 0 }, category: 'Yellow' },
    { code: '103', name: 'Pantone 103 C', displayName: 'P 103', hex: '#C6A00C', rgb: { r: 198, g: 160, b: 12 }, cmyk: { c: 0, m: 19, y: 94, k: 22 }, category: 'Yellow' },
    { code: '104', name: 'Pantone 104 C', displayName: 'P 104', hex: '#AD841F', rgb: { r: 173, g: 132, b: 31 }, cmyk: { c: 0, m: 24, y: 82, k: 32 }, category: 'Yellow' },
    { code: '105', name: 'Pantone 105 C', displayName: 'P 105', hex: '#8E6F26', rgb: { r: 142, g: 111, b: 38 }, cmyk: { c: 0, m: 22, y: 73, k: 44 }, category: 'Yellow' },
    { code: '106', name: 'Pantone 106 C', displayName: 'P 106', hex: '#7C6A2E', rgb: { r: 124, g: 106, b: 46 }, cmyk: { c: 0, m: 15, y: 63, k: 51 }, category: 'Yellow' },
    { code: '107', name: 'Pantone 107 C', displayName: 'P 107', hex: '#F9E547', rgb: { r: 249, g: 229, b: 71 }, cmyk: { c: 0, m: 8, y: 71, k: 2 }, category: 'Yellow' },
    { code: '108', name: 'Pantone 108 C', displayName: 'P 108', hex: '#F9E04C', rgb: { r: 249, g: 224, b: 76 }, cmyk: { c: 0, m: 10, y: 69, k: 2 }, category: 'Yellow' },
    { code: '109', name: 'Pantone 109 C', displayName: 'P 109', hex: '#FFD700', rgb: { r: 255, g: 215, b: 0 }, cmyk: { c: 0, m: 16, y: 100, k: 0 }, category: 'Yellow' },
    { code: '110', name: 'Pantone 110 C', displayName: 'P 110', hex: '#DAAA00', rgb: { r: 218, g: 170, b: 0 }, cmyk: { c: 0, m: 22, y: 100, k: 15 }, category: 'Yellow' },
    { code: '111', name: 'Pantone 111 C', displayName: 'P 111', hex: '#C69214', rgb: { r: 198, g: 146, b: 20 }, cmyk: { c: 0, m: 26, y: 90, k: 22 }, category: 'Yellow' },
    { code: '112', name: 'Pantone 112 C', displayName: 'P 112', hex: '#AA7E1C', rgb: { r: 170, g: 126, b: 28 }, cmyk: { c: 0, m: 26, y: 84, k: 33 }, category: 'Yellow' },
    { code: '113', name: 'Pantone 113 C', displayName: 'P 113', hex: '#8C6D1F', rgb: { r: 140, g: 109, b: 31 }, cmyk: { c: 0, m: 22, y: 78, k: 45 }, category: 'Yellow' },
    { code: '114', name: 'Pantone 114 C', displayName: 'P 114', hex: '#FFD662', rgb: { r: 255, g: 214, b: 98 }, cmyk: { c: 0, m: 16, y: 62, k: 0 }, category: 'Yellow' },
    { code: '115', name: 'Pantone 115 C', displayName: 'P 115', hex: '#FFD24C', rgb: { r: 255, g: 210, b: 76 }, cmyk: { c: 0, m: 18, y: 70, k: 0 }, category: 'Yellow' },
    { code: '116', name: 'Pantone 116 C', displayName: 'P 116', hex: '#FFCD00', rgb: { r: 255, g: 205, b: 0 }, cmyk: { c: 0, m: 20, y: 100, k: 0 }, category: 'Yellow' },
    { code: '117', name: 'Pantone 117 C', displayName: 'P 117', hex: '#C89F0C', rgb: { r: 200, g: 159, b: 12 }, cmyk: { c: 0, m: 21, y: 94, k: 22 }, category: 'Yellow' },
    { code: '118', name: 'Pantone 118 C', displayName: 'P 118', hex: '#AC8400', rgb: { r: 172, g: 132, b: 0 }, cmyk: { c: 0, m: 23, y: 100, k: 33 }, category: 'Yellow' },
    { code: '119', name: 'Pantone 119 C', displayName: 'P 119', hex: '#8E6F0C', rgb: { r: 142, g: 111, b: 12 }, cmyk: { c: 0, m: 22, y: 92, k: 44 }, category: 'Yellow' },
    { code: '120', name: 'Pantone 120 C', displayName: 'P 120', hex: '#FBDB65', rgb: { r: 251, g: 219, b: 101 }, cmyk: { c: 0, m: 13, y: 60, k: 2 }, category: 'Yellow' },
    { code: '121', name: 'Pantone 121 C', displayName: 'P 121', hex: '#FDD755', rgb: { r: 253, g: 215, b: 85 }, cmyk: { c: 0, m: 15, y: 66, k: 1 }, category: 'Yellow' },
    { code: '122', name: 'Pantone 122 C', displayName: 'P 122', hex: '#FED141', rgb: { r: 254, g: 209, b: 65 }, cmyk: { c: 0, m: 18, y: 74, k: 0 }, category: 'Yellow' },
    { code: '123', name: 'Pantone 123 C', displayName: 'P 123', hex: '#FFC82E', rgb: { r: 255, g: 200, b: 46 }, cmyk: { c: 0, m: 19, y: 89, k: 0 }, category: 'Yellow' },
    { code: '124', name: 'Pantone 124 C', displayName: 'P 124', hex: '#FFAA4D', rgb: { r: 255, g: 170, b: 77 }, cmyk: { c: 0, m: 33, y: 70, k: 0 }, category: 'Yellow' },
    { code: '125', name: 'Pantone 125 C', displayName: 'P 125', hex: '#FFB81C', rgb: { r: 255, g: 184, b: 28 }, cmyk: { c: 0, m: 28, y: 89, k: 0 }, category: 'Yellow' },
    { code: '126', name: 'Pantone 126 C', displayName: 'P 126', hex: '#E39D0E', rgb: { r: 227, g: 157, b: 14 }, cmyk: { c: 0, m: 31, y: 94, k: 11 }, category: 'Yellow' },
    { code: '127', name: 'Pantone 127 C', displayName: 'P 127', hex: '#C68C0A', rgb: { r: 198, g: 140, b: 10 }, cmyk: { c: 0, m: 29, y: 95, k: 22 }, category: 'Yellow' },
    { code: '128', name: 'Pantone 128 C', displayName: 'P 128', hex: '#F3E500', rgb: { r: 243, g: 229, b: 0 }, cmyk: { c: 0, m: 6, y: 100, k: 5 }, category: 'Yellow' },
    { code: '129', name: 'Pantone 129 C', displayName: 'P 129', hex: '#F2D600', rgb: { r: 242, g: 214, b: 0 }, cmyk: { c: 0, m: 12, y: 100, k: 5 }, category: 'Yellow' },
    { code: '130', name: 'Pantone 130 C', displayName: 'P 130', hex: '#F1C400', rgb: { r: 241, g: 196, b: 0 }, cmyk: { c: 0, m: 19, y: 100, k: 5 }, category: 'Yellow' },
    { code: '131', name: 'Pantone 131 C', displayName: 'P 131', hex: '#C1A01E', rgb: { r: 193, g: 160, b: 30 }, cmyk: { c: 0, m: 17, y: 84, k: 24 }, category: 'Yellow' },
    { code: '132', name: 'Pantone 132 C', displayName: 'P 132', hex: '#A08629', rgb: { r: 160, g: 134, b: 41 }, cmyk: { c: 0, m: 16, y: 74, k: 37 }, category: 'Yellow' },
    { code: '133', name: 'Pantone 133 C', displayName: 'P 133', hex: '#876D2E', rgb: { r: 135, g: 109, b: 46 }, cmyk: { c: 0, m: 19, y: 66, k: 47 }, category: 'Yellow' },
    { code: '134', name: 'Pantone 134 C', displayName: 'P 134', hex: '#FDD26E', rgb: { r: 253, g: 210, b: 110 }, cmyk: { c: 0, m: 17, y: 57, k: 1 }, category: 'Yellow' },

    // ===== VERDES =====
    { code: '347', name: 'Pantone 347 C', displayName: 'P 347', hex: '#009639', rgb: { r: 0, g: 150, b: 57 }, cmyk: { c: 100, m: 0, y: 62, k: 41 }, category: 'Green' },
    { code: '348', name: 'Pantone 348 C', displayName: 'P 348', hex: '#00843D', rgb: { r: 0, g: 132, b: 61 }, cmyk: { c: 100, m: 0, y: 54, k: 48 }, category: 'Green' },
    { code: '349', name: 'Pantone 349 C', displayName: 'P 349', hex: '#046A38', rgb: { r: 4, g: 106, b: 56 }, cmyk: { c: 96, m: 0, y: 47, k: 58 }, category: 'Green' },
    { code: '355', name: 'Pantone 355 C', displayName: 'P 355', hex: '#00B140', rgb: { r: 0, g: 177, b: 64 }, cmyk: { c: 100, m: 0, y: 100, k: 5 }, category: 'Green' },
    { code: '356', name: 'Pantone 356 C', displayName: 'P 356', hex: '#007A33', rgb: { r: 0, g: 122, b: 51 }, cmyk: { c: 100, m: 0, y: 58, k: 52 }, category: 'Green' },
    { code: '357', name: 'Pantone 357 C', displayName: 'P 357', hex: '#215732', rgb: { r: 33, g: 87, b: 50 }, cmyk: { c: 62, m: 0, y: 42, k: 66 }, category: 'Green' },
    { code: '376', name: 'Pantone 376 C', displayName: 'P 376', hex: '#84BD00', rgb: { r: 132, g: 189, b: 0 }, cmyk: { c: 55, m: 0, y: 100, k: 5 }, category: 'Green' },
    { code: '377', name: 'Pantone 377 C', displayName: 'P 377', hex: '#7A9A01', rgb: { r: 122, g: 154, b: 1 }, cmyk: { c: 21, m: 0, y: 99, k: 40 }, category: 'Green' },
    { code: '3405', name: 'Pantone 3405 C', displayName: 'P 3405', hex: '#00B140', rgb: { r: 0, g: 177, b: 64 }, cmyk: { c: 100, m: 0, y: 64, k: 31 }, category: 'Green' },

    // ===== AZULES =====
    { code: '285', name: 'Pantone 285 C', displayName: 'P 285', hex: '#0072CE', rgb: { r: 0, g: 114, b: 206 }, cmyk: { c: 74, m: 43, y: 0, k: 0 }, category: 'Blue' },
    { code: '286', name: 'Pantone 286 C', displayName: 'P 286', hex: '#0033A0', rgb: { r: 0, g: 51, b: 160 }, cmyk: { c: 100, m: 68, y: 0, k: 37 }, category: 'Blue' },
    { code: '287', name: 'Pantone 287 C', displayName: 'P 287', hex: '#002F6C', rgb: { r: 0, g: 47, b: 108 }, cmyk: { c: 100, m: 56, y: 0, k: 58 }, category: 'Blue' },
    { code: '290', name: 'Pantone 290 C', displayName: 'P 290', hex: '#B9D9EB', rgb: { r: 185, g: 217, b: 235 }, cmyk: { c: 21, m: 8, y: 0, k: 8 }, category: 'Blue' },
    { code: '291', name: 'Pantone 291 C', displayName: 'P 291', hex: '#9BCBEB', rgb: { r: 155, g: 203, b: 235 }, cmyk: { c: 34, m: 14, y: 0, k: 8 }, category: 'Blue' },
    { code: '292', name: 'Pantone 292 C', displayName: 'P 292', hex: '#69B3E7', rgb: { r: 105, g: 179, b: 231 }, cmyk: { c: 54, m: 22, y: 0, k: 9 }, category: 'Blue' },
    { code: '293', name: 'Pantone 293 C', displayName: 'P 293', hex: '#00539F', rgb: { r: 0, g: 83, b: 159 }, cmyk: { c: 100, m: 48, y: 0, k: 38 }, category: 'Blue' },
    { code: '294', name: 'Pantone 294 C', displayName: 'P 294', hex: '#003865', rgb: { r: 0, g: 56, b: 101 }, cmyk: { c: 100, m: 45, y: 0, k: 60 }, category: 'Blue' },
    { code: '295', name: 'Pantone 295 C', displayName: 'P 295', hex: '#002855', rgb: { r: 0, g: 40, b: 85 }, cmyk: { c: 100, m: 53, y: 0, k: 67 }, category: 'Blue' },
    { code: '296', name: 'Pantone 296 C', displayName: 'P 296', hex: '#001E3C', rgb: { r: 0, g: 30, b: 60 }, cmyk: { c: 100, m: 50, y: 0, k: 76 }, category: 'Blue' },
    { code: '297', name: 'Pantone 297 C', displayName: 'P 297', hex: '#71C5E8', rgb: { r: 113, g: 197, b: 232 }, cmyk: { c: 51, m: 15, y: 0, k: 9 }, category: 'Blue' },
    { code: '298', name: 'Pantone 298 C', displayName: 'P 298', hex: '#41B6E6', rgb: { r: 65, g: 182, b: 230 }, cmyk: { c: 72, m: 21, y: 0, k: 10 }, category: 'Blue' },
    { code: '299', name: 'Pantone 299 C', displayName: 'P 299', hex: '#00A3E0', rgb: { r: 0, g: 163, b: 224 }, cmyk: { c: 100, m: 27, y: 0, k: 12 }, category: 'Blue' },
    { code: '300', name: 'Pantone 300 C', displayName: 'P 300', hex: '#005EB8', rgb: { r: 0, g: 94, b: 184 }, cmyk: { c: 100, m: 49, y: 0, k: 28 }, category: 'Blue' },
    { code: '301', name: 'Pantone 301 C', displayName: 'P 301', hex: '#004B87', rgb: { r: 0, g: 75, b: 135 }, cmyk: { c: 100, m: 44, y: 0, k: 47 }, category: 'Blue' },
    { code: '302', name: 'Pantone 302 C', displayName: 'P 302', hex: '#003B5C', rgb: { r: 0, g: 59, b: 92 }, cmyk: { c: 100, m: 36, y: 0, k: 64 }, category: 'Blue' },
    { code: '303', name: 'Pantone 303 C', displayName: 'P 303', hex: '#002A3A', rgb: { r: 0, g: 42, b: 58 }, cmyk: { c: 100, m: 28, y: 0, k: 77 }, category: 'Blue' },
    { code: '304', name: 'Pantone 304 C', displayName: 'P 304', hex: '#9ADBE8', rgb: { r: 154, g: 219, b: 232 }, cmyk: { c: 34, m: 6, y: 0, k: 9 }, category: 'Blue' },
    { code: '305', name: 'Pantone 305 C', displayName: 'P 305', hex: '#59CBE8', rgb: { r: 89, g: 203, b: 232 }, cmyk: { c: 62, m: 13, y: 0, k: 9 }, category: 'Blue' },
    { code: '306', name: 'Pantone 306 C', displayName: 'P 306', hex: '#00B5E2', rgb: { r: 0, g: 181, b: 226 }, cmyk: { c: 100, m: 20, y: 0, k: 11 }, category: 'Blue' },
    { code: '307', name: 'Pantone 307 C', displayName: 'P 307', hex: '#006BA6', rgb: { r: 0, g: 107, b: 166 }, cmyk: { c: 100, m: 36, y: 0, k: 35 }, category: 'Blue' },
    { code: '308', name: 'Pantone 308 C', displayName: 'P 308', hex: '#00587C', rgb: { r: 0, g: 88, b: 124 }, cmyk: { c: 100, m: 29, y: 0, k: 51 }, category: 'Blue' },
    { code: '2925', name: 'Pantone 2925 C', displayName: 'P 2925', hex: '#009CDE', rgb: { r: 0, g: 156, b: 222 }, cmyk: { c: 100, m: 30, y: 0, k: 13 }, category: 'Blue' },
    { code: '2935', name: 'Pantone 2935 C', displayName: 'P 2935', hex: '#0057B8', rgb: { r: 0, g: 87, b: 184 }, cmyk: { c: 100, m: 53, y: 0, k: 28 }, category: 'Blue' },
    { code: '2945', name: 'Pantone 2945 C', displayName: 'P 2945', hex: '#004C97', rgb: { r: 0, g: 76, b: 151 }, cmyk: { c: 100, m: 50, y: 0, k: 41 }, category: 'Blue' },
    { code: '2955', name: 'Pantone 2955 C', displayName: 'P 2955', hex: '#003DA5', rgb: { r: 0, g: 61, b: 165 }, cmyk: { c: 100, m: 63, y: 0, k: 35 }, category: 'Blue' },
    { code: '2965', name: 'Pantone 2965 C', displayName: 'P 2965', hex: '#003594', rgb: { r: 0, g: 53, b: 148 }, cmyk: { c: 100, m: 64, y: 0, k: 42 }, category: 'Blue' },
    { code: 'Reflex Blue', name: 'Pantone Reflex Blue', displayName: 'P Reflex Blue', hex: '#001489', rgb: { r: 0, g: 20, b: 137 }, cmyk: { c: 100, m: 82, y: 0, k: 46 }, category: 'Blue' },
    { code: '280', name: 'Pantone 280 C', displayName: 'P 280', hex: '#012169', rgb: { r: 1, g: 33, b: 105 }, cmyk: { c: 99, m: 69, y: 0, k: 59 }, category: 'Blue' },
    { code: '281', name: 'Pantone 281 C', displayName: 'P 281', hex: '#00205B', rgb: { r: 0, g: 32, b: 91 }, cmyk: { c: 100, m: 65, y: 0, k: 64 }, category: 'Blue' },
    { code: '282', name: 'Pantone 282 C', displayName: 'P 282', hex: '#041E42', rgb: { r: 4, g: 30, b: 66 }, cmyk: { c: 94, m: 55, y: 0, k: 74 }, category: 'Blue' },
    { code: '283', name: 'Pantone 283 C', displayName: 'P 283', hex: '#92C1E9', rgb: { r: 146, g: 193, b: 233 }, cmyk: { c: 37, m: 17, y: 0, k: 9 }, category: 'Blue' },
    { code: '284', name: 'Pantone 284 C', displayName: 'P 284', hex: '#6CACE4', rgb: { r: 108, g: 172, b: 228 }, cmyk: { c: 53, m: 25, y: 0, k: 11 }, category: 'Blue' },
    { code: '288', name: 'Pantone 288 C', displayName: 'P 288', hex: '#002D72', rgb: { r: 0, g: 45, b: 114 }, cmyk: { c: 100, m: 61, y: 0, k: 55 }, category: 'Blue' },
    { code: '289', name: 'Pantone 289 C', displayName: 'P 289', hex: '#0C2340', rgb: { r: 12, g: 35, b: 64 }, cmyk: { c: 81, m: 45, y: 0, k: 75 }, category: 'Blue' },
    { code: '532', name: 'Pantone 532 C', displayName: 'P 532', hex: '#27384C', rgb: { r: 39, g: 56, b: 76 }, cmyk: { c: 49, m: 26, y: 0, k: 70 }, category: 'Blue' },
    { code: '533', name: 'Pantone 533 C', displayName: 'P 533', hex: '#1F2A44', rgb: { r: 31, g: 42, b: 68 }, cmyk: { c: 54, m: 38, y: 0, k: 73 }, category: 'Blue' },
    { code: '534', name: 'Pantone 534 C', displayName: 'P 534', hex: '#1B2A3E', rgb: { r: 27, g: 42, b: 62 }, cmyk: { c: 56, m: 32, y: 0, k: 76 }, category: 'Blue' },
    { code: '535', name: 'Pantone 535 C', displayName: 'P 535', hex: '#1A2332', rgb: { r: 26, g: 35, b: 50 }, cmyk: { c: 48, m: 30, y: 0, k: 80 }, category: 'Blue' },

    // ===== VERDES (SERIE 3500 Y 7700) =====
    { code: '3520', name: 'Pantone 3520 C', displayName: 'P 3520', hex: '#7FD13B', rgb: { r: 127, g: 209, b: 59 }, cmyk: { c: 39, m: 0, y: 72, k: 18 }, category: 'Green' },
    { code: '3522', name: 'Pantone 3522 C', displayName: 'P 3522', hex: '#6CC24A', rgb: { r: 108, g: 194, b: 74 }, cmyk: { c: 44, m: 0, y: 62, k: 24 }, category: 'Green' },
    { code: '3525', name: 'Pantone 3525 C', displayName: 'P 3525', hex: '#57AB27', rgb: { r: 87, g: 171, b: 39 }, cmyk: { c: 49, m: 0, y: 77, k: 33 }, category: 'Green' },
    { code: '3527', name: 'Pantone 3527 C', displayName: 'P 3527', hex: '#3A7728', rgb: { r: 58, g: 119, b: 40 }, cmyk: { c: 51, m: 0, y: 66, k: 53 }, category: 'Green' },
    { code: '3529', name: 'Pantone 3529 C', displayName: 'P 3529', hex: '#1CA421', rgb: { r: 28, g: 164, b: 33 }, cmyk: { c: 83, m: 0, y: 80, k: 36 }, category: 'Green' },
    { code: '7730', name: 'Pantone 7730 C', displayName: 'P 7730', hex: '#4B9560', rgb: { r: 75, g: 149, b: 96 }, cmyk: { c: 50, m: 0, y: 36, k: 42 }, category: 'Green' },
    { code: '7732', name: 'Pantone 7732 C', displayName: 'P 7732', hex: '#3E8853', rgb: { r: 62, g: 136, b: 83 }, cmyk: { c: 54, m: 0, y: 39, k: 47 }, category: 'Green' },
    { code: '7734', name: 'Pantone 7734 C', displayName: 'P 7734', hex: '#3A7D44', rgb: { r: 58, g: 125, b: 68 }, cmyk: { c: 54, m: 0, y: 46, k: 51 }, category: 'Green' },
    { code: '7736', name: 'Pantone 7736 C', displayName: 'P 7736', hex: '#34703D', rgb: { r: 52, g: 112, b: 61 }, cmyk: { c: 54, m: 0, y: 46, k: 56 }, category: 'Green' },
    { code: '7738', name: 'Pantone 7738 C', displayName: 'P 7738', hex: '#275D38', rgb: { r: 39, g: 93, b: 56 }, cmyk: { c: 58, m: 0, y: 40, k: 64 }, category: 'Green' },
    { code: '7739', name: 'Pantone 7739 C', displayName: 'P 7739', hex: '#319B42', rgb: { r: 49, g: 155, b: 66 }, cmyk: { c: 68, m: 0, y: 57, k: 39 }, category: 'Green' },

    // ===== CYAN/TURQUESA (SERIE 4100) =====
    { code: '4170', name: 'Pantone 4170 C', displayName: 'P 4170', hex: '#6ECEB2', rgb: { r: 110, g: 206, b: 178 }, cmyk: { c: 47, m: 0, y: 14, k: 19 }, category: 'Green' },
    { code: '4172', name: 'Pantone 4172 C', displayName: 'P 4172', hex: '#82B1AA', rgb: { r: 130, g: 177, b: 170 }, cmyk: { c: 27, m: 0, y: 4, k: 31 }, category: 'Green' },
    { code: '4174', name: 'Pantone 4174 C', displayName: 'P 4174', hex: '#84C1C1', rgb: { r: 132, g: 193, b: 193 }, cmyk: { c: 32, m: 0, y: 0, k: 24 }, category: 'Green' },
    { code: '4175', name: 'Pantone 4175 C', displayName: 'P 4175', hex: '#A8D5BA', rgb: { r: 168, g: 213, b: 186 }, cmyk: { c: 21, m: 0, y: 13, k: 16 }, category: 'Green' },
    { code: '4176', name: 'Pantone 4176 C', displayName: 'P 4176', hex: '#C6CDC1', rgb: { r: 198, g: 205, b: 193 }, cmyk: { c: 3, m: 0, y: 6, k: 20 }, category: 'Gray' },

    // ===== PÚRPURAS Y VIOLETAS =====
    { code: '233', name: 'Pantone 233 C', displayName: 'P 233', hex: '#B3006B', rgb: { r: 179, g: 0, b: 107 }, cmyk: { c: 0, m: 100, y: 40, k: 30 }, category: 'Purple' },
    { code: '256', name: 'Pantone 256 C', displayName: 'P 256', hex: '#D8A0DB', rgb: { r: 216, g: 160, b: 219 }, cmyk: { c: 1, m: 27, y: 0, k: 14 }, category: 'Purple' },
    { code: '257', name: 'Pantone 257 C', displayName: 'P 257', hex: '#CD92D2', rgb: { r: 205, g: 146, b: 210 }, cmyk: { c: 2, m: 30, y: 0, k: 18 }, category: 'Purple' },
    { code: '258', name: 'Pantone 258 C', displayName: 'P 258', hex: '#8E5294', rgb: { r: 142, g: 82, b: 148 }, cmyk: { c: 4, m: 45, y: 0, k: 42 }, category: 'Purple' },
    { code: '259', name: 'Pantone 259 C', displayName: 'P 259', hex: '#6A2A6D', rgb: { r: 106, g: 42, b: 109 }, cmyk: { c: 3, m: 61, y: 0, k: 57 }, category: 'Purple' },
    { code: '260', name: 'Pantone 260 C', displayName: 'P 260', hex: '#601F5E', rgb: { r: 96, g: 31, b: 94 }, cmyk: { c: 0, m: 68, y: 2, k: 62 }, category: 'Purple' },
    { code: '261', name: 'Pantone 261 C', displayName: 'P 261', hex: '#54134E', rgb: { r: 84, g: 19, b: 78 }, cmyk: { c: 0, m: 77, y: 7, k: 67 }, category: 'Purple' },
    { code: '262', name: 'Pantone 262 C', displayName: 'P 262', hex: '#440A3D', rgb: { r: 68, g: 10, b: 61 }, cmyk: { c: 0, m: 85, y: 10, k: 73 }, category: 'Purple' },
    { code: '263', name: 'Pantone 263 C', displayName: 'P 263', hex: '#3D0734', rgb: { r: 61, g: 7, b: 52 }, cmyk: { c: 0, m: 89, y: 15, k: 76 }, category: 'Purple' },
    { code: '264', name: 'Pantone 264 C', displayName: 'P 264', hex: '#2E0329', rgb: { r: 46, g: 3, b: 41 }, cmyk: { c: 0, m: 93, y: 11, k: 82 }, category: 'Purple' },
    { code: '265', name: 'Pantone 265 C', displayName: 'P 265', hex: '#C5B4E3', rgb: { r: 197, g: 180, b: 227 }, cmyk: { c: 13, m: 21, y: 0, k: 11 }, category: 'Purple' },
    { code: '266', name: 'Pantone 266 C', displayName: 'P 266', hex: '#B09CD9', rgb: { r: 176, g: 156, b: 217 }, cmyk: { c: 19, m: 28, y: 0, k: 15 }, category: 'Purple' },
    { code: '267', name: 'Pantone 267 C', displayName: 'P 267', hex: '#9678D3', rgb: { r: 150, g: 120, b: 211 }, cmyk: { c: 29, m: 43, y: 0, k: 17 }, category: 'Purple' },
    { code: '268', name: 'Pantone 268 C', displayName: 'P 268', hex: '#6D2077', rgb: { r: 109, g: 32, b: 119 }, cmyk: { c: 8, m: 73, y: 0, k: 53 }, category: 'Purple' },
    { code: '269', name: 'Pantone 269 C', displayName: 'P 269', hex: '#5C068C', rgb: { r: 92, g: 6, b: 140 }, cmyk: { c: 34, m: 96, y: 0, k: 45 }, category: 'Purple' },
    { code: '270', name: 'Pantone 270 C', displayName: 'P 270', hex: '#B8A9D1', rgb: { r: 184, g: 169, b: 209 }, cmyk: { c: 12, m: 19, y: 0, k: 18 }, category: 'Purple' },
    { code: '271', name: 'Pantone 271 C', displayName: 'P 271', hex: '#A391C6', rgb: { r: 163, g: 145, b: 198 }, cmyk: { c: 18, m: 27, y: 0, k: 22 }, category: 'Purple' },
    { code: '272', name: 'Pantone 272 C', displayName: 'P 272', hex: '#7578BC', rgb: { r: 117, g: 120, b: 188 }, cmyk: { c: 38, m: 36, y: 0, k: 26 }, category: 'Purple' },
    { code: '273', name: 'Pantone 273 C', displayName: 'P 273', hex: '#241773', rgb: { r: 36, g: 23, b: 115 }, cmyk: { c: 69, m: 80, y: 0, k: 55 }, category: 'Purple' },
    { code: '274', name: 'Pantone 274 C', displayName: 'P 274', hex: '#211551', rgb: { r: 33, g: 21, b: 81 }, cmyk: { c: 59, m: 74, y: 0, k: 68 }, category: 'Purple' },
    { code: '275', name: 'Pantone 275 C', displayName: 'P 275', hex: '#1E163D', rgb: { r: 30, g: 22, b: 61 }, cmyk: { c: 51, m: 64, y: 0, k: 76 }, category: 'Purple' },
    { code: '276', name: 'Pantone 276 C', displayName: 'P 276', hex: '#1A142A', rgb: { r: 26, g: 20, b: 42 }, cmyk: { c: 38, m: 52, y: 0, k: 84 }, category: 'Purple' },
    { code: '277', name: 'Pantone 277 C', displayName: 'P 277', hex: '#B8CBE6', rgb: { r: 184, g: 203, b: 230 }, cmyk: { c: 20, m: 12, y: 0, k: 10 }, category: 'Blue' },
    { code: '278', name: 'Pantone 278 C', displayName: 'P 278', hex: '#8BB8E8', rgb: { r: 139, g: 184, b: 232 }, cmyk: { c: 40, m: 21, y: 0, k: 9 }, category: 'Blue' },
    { code: '279', name: 'Pantone 279 C', displayName: 'P 279', hex: '#418FDE', rgb: { r: 65, g: 143, b: 222 }, cmyk: { c: 71, m: 36, y: 0, k: 13 }, category: 'Blue' },

    // ===== GRISES =====
    { code: 'Cool Gray 1', name: 'Pantone Cool Gray 1 C', displayName: 'P CG 1', hex: '#D9D9D6', rgb: { r: 217, g: 217, b: 214 }, cmyk: { c: 0, m: 0, y: 0, k: 15 }, category: 'Gray' },
    { code: 'Cool Gray 2', name: 'Pantone Cool Gray 2 C', displayName: 'P CG 2', hex: '#D0D0CE', rgb: { r: 208, g: 208, b: 206 }, cmyk: { c: 0, m: 0, y: 0, k: 18 }, category: 'Gray' },
    { code: 'Cool Gray 3', name: 'Pantone Cool Gray 3 C', displayName: 'P CG 3', hex: '#C8C9C7', rgb: { r: 200, g: 201, b: 199 }, cmyk: { c: 0, m: 0, y: 0, k: 21 }, category: 'Gray' },
    { code: 'Cool Gray 4', name: 'Pantone Cool Gray 4 C', displayName: 'P CG 4', hex: '#BBBCBC', rgb: { r: 187, g: 188, b: 188 }, cmyk: { c: 0, m: 0, y: 0, k: 26 }, category: 'Gray' },
    { code: 'Cool Gray 5', name: 'Pantone Cool Gray 5 C', displayName: 'P CG 5', hex: '#B1B3B3', rgb: { r: 177, g: 179, b: 179 }, cmyk: { c: 0, m: 0, y: 0, k: 30 }, category: 'Gray' },
    { code: 'Cool Gray 6', name: 'Pantone Cool Gray 6 C', displayName: 'P CG 6', hex: '#A7A8AA', rgb: { r: 167, g: 168, b: 170 }, cmyk: { c: 0, m: 0, y: 0, k: 33 }, category: 'Gray' },
    { code: 'Cool Gray 7', name: 'Pantone Cool Gray 7 C', displayName: 'P CG 7', hex: '#97999B', rgb: { r: 151, g: 153, b: 155 }, cmyk: { c: 0, m: 0, y: 0, k: 39 }, category: 'Gray' },
    { code: 'Cool Gray 8', name: 'Pantone Cool Gray 8 C', displayName: 'P CG 8', hex: '#888B8D', rgb: { r: 136, g: 139, b: 141 }, cmyk: { c: 0, m: 0, y: 0, k: 45 }, category: 'Gray' },
    { code: 'Cool Gray 9', name: 'Pantone Cool Gray 9 C', displayName: 'P CG 9', hex: '#75787B', rgb: { r: 117, g: 120, b: 123 }, cmyk: { c: 0, m: 0, y: 0, k: 52 }, category: 'Gray' },
    { code: 'Cool Gray 10', name: 'Pantone Cool Gray 10 C', displayName: 'P CG 10', hex: '#63666A', rgb: { r: 99, g: 102, b: 106 }, cmyk: { c: 0, m: 0, y: 0, k: 58 }, category: 'Gray' },
    { code: 'Cool Gray 11', name: 'Pantone Cool Gray 11 C', displayName: 'P CG 11', hex: '#53565A', rgb: { r: 83, g: 86, b: 90 }, cmyk: { c: 0, m: 0, y: 0, k: 65 }, category: 'Gray' },

    // ===== METÁLICOS =====
    { code: '877', name: 'Pantone 877 C', displayName: 'P 877', hex: '#8A8D8F', rgb: { r: 138, g: 141, b: 143 }, cmyk: { c: 3, m: 1, y: 0, k: 44 }, category: 'Metallic' },
    { code: '871', name: 'Pantone 871 C', displayName: 'P 871', hex: '#84754E', rgb: { r: 132, g: 117, b: 78 }, cmyk: { c: 0, m: 11, y: 41, k: 48 }, category: 'Metallic' },
    { code: '872', name: 'Pantone 872 C', displayName: 'P 872', hex: '#85714D', rgb: { r: 133, g: 113, b: 77 }, cmyk: { c: 0, m: 15, y: 42, k: 48 }, category: 'Metallic' },
    { code: '873', name: 'Pantone 873 C', displayName: 'P 873', hex: '#866D4B', rgb: { r: 134, g: 109, b: 75 }, cmyk: { c: 0, m: 19, y: 44, k: 47 }, category: 'Metallic' },
    { code: '874', name: 'Pantone 874 C', displayName: 'P 874', hex: '#8B6F47', rgb: { r: 139, g: 111, b: 71 }, cmyk: { c: 0, m: 20, y: 49, k: 45 }, category: 'Metallic' },
    { code: '875', name: 'Pantone 875 C', displayName: 'P 875', hex: '#87674F', rgb: { r: 135, g: 103, b: 79 }, cmyk: { c: 0, m: 24, y: 41, k: 47 }, category: 'Metallic' },
    { code: '876', name: 'Pantone 876 C', displayName: 'P 876', hex: '#7C878E', rgb: { r: 124, g: 135, b: 142 }, cmyk: { c: 13, m: 5, y: 0, k: 44 }, category: 'Metallic' },

    // ===== COLORES ADICIONALES COMUNES =====
    { code: '7684', name: 'Pantone 7684 C', displayName: 'P 7684', hex: '#6ECEB2', rgb: { r: 110, g: 206, b: 178 }, cmyk: { c: 47, m: 0, y: 14, k: 19 }, category: 'Green' },
    { code: '7685', name: 'Pantone 7685 C', displayName: 'P 7685', hex: '#00B2A9', rgb: { r: 0, g: 178, b: 169 }, cmyk: { c: 100, m: 0, y: 5, k: 30 }, category: 'Green' },
    { code: '7686', name: 'Pantone 7686 C', displayName: 'P 7686', hex: '#008675', rgb: { r: 0, g: 134, b: 117 }, cmyk: { c: 100, m: 0, y: 13, k: 47 }, category: 'Green' },
    { code: '7687', name: 'Pantone 7687 C', displayName: 'P 7687', hex: '#00594F', rgb: { r: 0, g: 89, b: 79 }, cmyk: { c: 100, m: 0, y: 11, k: 65 }, category: 'Green' },
    { code: '7409', name: 'Pantone 7409 C', displayName: 'P 7409', hex: '#00A499', rgb: { r: 0, g: 164, b: 153 }, cmyk: { c: 100, m: 0, y: 7, k: 36 }, category: 'Green' },
    
    // ===== SERIE 1900 (AZULES Y MORADOS) =====
    { code: '1915', name: 'Pantone 1915 C', displayName: 'P 1915', hex: '#8B3F8F', rgb: { r: 139, g: 63, b: 143 }, cmyk: { c: 3, m: 56, y: 0, k: 44 }, category: 'Purple' },
    { code: '1925', name: 'Pantone 1925 C', displayName: 'P 1925', hex: '#2E3192', rgb: { r: 46, g: 49, b: 146 }, cmyk: { c: 68, m: 66, y: 0, k: 43 }, category: 'Blue' },
    { code: '1935', name: 'Pantone 1935 C', displayName: 'P 1935', hex: '#0047BB', rgb: { r: 0, g: 71, b: 187 }, cmyk: { c: 100, m: 62, y: 0, k: 27 }, category: 'Blue' },
    { code: '1945', name: 'Pantone 1945 C', displayName: 'P 1945', hex: '#0067A0', rgb: { r: 0, g: 103, b: 160 }, cmyk: { c: 100, m: 36, y: 0, k: 37 }, category: 'Blue' },
    { code: '1955', name: 'Pantone 1955 C', displayName: 'P 1955', hex: '#006BA6', rgb: { r: 0, g: 107, b: 166 }, cmyk: { c: 100, m: 36, y: 0, k: 35 }, category: 'Blue' },
    
    // ===== SERIE 3200 (VERDES) =====
    { code: '3242', name: 'Pantone 3242 C', displayName: 'P 3242', hex: '#00C389', rgb: { r: 0, g: 195, b: 137 }, cmyk: { c: 100, m: 0, y: 30, k: 24 }, category: 'Green' },
    { code: '3252', name: 'Pantone 3252 C', displayName: 'P 3252', hex: '#00B388', rgb: { r: 0, g: 179, b: 136 }, cmyk: { c: 100, m: 0, y: 24, k: 30 }, category: 'Green' },
    { code: '3262', name: 'Pantone 3262 C', displayName: 'P 3262', hex: '#00A982', rgb: { r: 0, g: 169, b: 130 }, cmyk: { c: 100, m: 0, y: 23, k: 34 }, category: 'Green' },
    { code: '3265', name: 'Pantone 3265 C', displayName: 'P 3265', hex: '#00A376', rgb: { r: 0, g: 163, b: 118 }, cmyk: { c: 100, m: 0, y: 28, k: 36 }, category: 'Green' },
    { code: '3272', name: 'Pantone 3272 C', displayName: 'P 3272', hex: '#007A5E', rgb: { r: 0, g: 122, b: 94 }, cmyk: { c: 100, m: 0, y: 23, k: 52 }, category: 'Green' },
    { code: '3282', name: 'Pantone 3282 C', displayName: 'P 3282', hex: '#006F62', rgb: { r: 0, g: 111, b: 98 }, cmyk: { c: 100, m: 0, y: 12, k: 56 }, category: 'Green' },
    { code: '3292', name: 'Pantone 3292 C', displayName: 'P 3292', hex: '#00594C', rgb: { r: 0, g: 89, b: 76 }, cmyk: { c: 100, m: 0, y: 15, k: 65 }, category: 'Green' },
    { code: '3298', name: 'Pantone 3298 C', displayName: 'P 3298', hex: '#004F3E', rgb: { r: 0, g: 79, b: 62 }, cmyk: { c: 100, m: 0, y: 22, k: 69 }, category: 'Green' },
    
    // ===== COLORES NEGRO Y BLANCO (NOMBRES COMUNES) =====
    { code: 'NEGRO', name: 'Negro', displayName: 'P NEGRO', hex: '#000000', rgb: { r: 0, g: 0, b: 0 }, cmyk: { c: 0, m: 0, y: 0, k: 100 }, category: 'Black' },
    { code: 'BLANCO', name: 'Blanco', displayName: 'P BLANCO', hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, cmyk: { c: 0, m: 0, y: 0, k: 0 }, category: 'White' },
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
    // Eliminar cualquier prefijo "p ", "p_", "P ", "P_"
    let cleanCode = term;
    if (cleanCode.startsWith('p ') || cleanCode.startsWith('p_')) {
      cleanCode = cleanCode.substring(2).trim();
    }
    
    const formattedDisplay = `P ${cleanCode.toUpperCase()}`;

    // Generar un color basado en el nombre para mejor visualización
    const hex = this.generateColorFromName(cleanCode);

    return {
      code: cleanCode,
      name: `Pantone ${cleanCode}`,
      displayName: formattedDisplay,
      hex: hex,
      rgb: this.hexToRgb(hex),
      cmyk: { c: 0, m: 0, y: 0, k: 40 },
      category: 'Manual'
    };
  }

  /**
   * Genera un color hexadecimal basado en el nombre del color
   * Solo se usa como fallback cuando el color no existe en la librería
   */
  private generateColorFromName(name: string): string {
    const lowerName = name.toLowerCase();
    
    // Las lacas no tienen color - mostrar en gris
    if (lowerName.includes('laca') || lowerName.includes('lacquer') || lowerName.includes('varnish')) {
      return '#B0B0B0'; // Gris claro para lacas
    }
    
    // Si no coincide con ningún nombre, generar un color basado en hash
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  }

  /**
   * Convierte hexadecimal a RGB
   */
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

  /**
   * Busca un color por código, nombre o nombre de visualización.
   * Soporta formatos: "209", "P 209", "P_209", "Pantone 209", "NEGRO", "BLANCO"
   */
  getColorByCode(code: string): PantoneColor | undefined {
    const term = code.toLowerCase().trim();

    // Extraer el número si viene con prefijos
    let cleanCode = term;
    if (term.startsWith('p ')) cleanCode = term.substring(2).trim();
    else if (term.startsWith('p_')) cleanCode = term.substring(2).trim();
    else if (term.startsWith('pantone ')) cleanCode = term.substring(8).trim();

    // Buscar por código exacto (case-insensitive)
    const exactMatch = this.pantoneColors.find(color =>
      color.code.toLowerCase() === cleanCode ||
      color.code.toLowerCase() === term
    );
    if (exactMatch) return exactMatch;

    // Buscar por displayName
    const displayMatch = this.pantoneColors.find(color =>
      color.displayName.toLowerCase() === term ||
      color.displayName.toLowerCase() === `p ${cleanCode}`
    );
    if (displayMatch) return displayMatch;

    // Buscar por nombre completo
    const nameMatch = this.pantoneColors.find(color =>
      color.name.toLowerCase() === term
    );
    if (nameMatch) return nameMatch;

    return undefined;
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
}
