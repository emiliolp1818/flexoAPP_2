import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ColorTintaData {
  nombre: string;
  codTinta: string;
  cobertura: number | null;
  codAnilox: string;
}

export interface CodTintaRecord {
  id: number;
  articulo: string;
  descripcion: string;
  carpeta?: string;
  estante?: string;
  colores: ColorTintaData[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface CodTintaResponse {
  success: boolean;
  data: CodTintaRecord[];
}

@Injectable({
  providedIn: 'root'
})
export class CodTintasService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/cod-tintas`;

  /**
   * Buscar códigos de tintas por artículo
   */
  searchByArticulo(articulo: string): Observable<CodTintaRecord[]> {
    return this.http.get<CodTintaResponse>(`${this.apiUrl}/search/${articulo}`)
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Error buscando códigos de tintas:', error);
          return of([]);
        })
      );
  }

  /**
   * Obtener cobertura de un color específico para un artículo
   */
  getCoberturaForColor(articulo: string, colorName: string): Observable<number | null> {
    return this.searchByArticulo(articulo).pipe(
      map(records => {
        if (records.length === 0) {
          return null;
        }

        const record = records[0];
        const colorNormalizado = colorName.trim().toUpperCase();
        
        // Buscar el color en los datos
        const colorData = record.colores.find(c => 
          c.nombre.trim().toUpperCase() === colorNormalizado
        );

        return colorData?.cobertura || null;
      }),
      catchError(error => {
        console.error('Error obteniendo cobertura:', error);
        return of(null);
      })
    );
  }

  /**
   * Obtener código de anilox de un color específico para un artículo
   */
  getCodAniloxForColor(articulo: string, colorName: string): Observable<string | null> {
    return this.searchByArticulo(articulo).pipe(
      map(records => {
        if (records.length === 0) {
          return null;
        }

        const record = records[0];
        const colorNormalizado = colorName.trim().toUpperCase();
        
        // Buscar el color en los datos
        const colorData = record.colores.find(c => 
          c.nombre.trim().toUpperCase() === colorNormalizado
        );

        return colorData?.codAnilox || null;
      }),
      catchError(error => {
        console.error('Error obteniendo código de anilox:', error);
        return of(null);
      })
    );
  }

  /**
   * Obtener datos completos de un color (cobertura y código de anilox)
   */
  getColorData(articulo: string, colorName: string): Observable<ColorTintaData | null> {
    return this.searchByArticulo(articulo).pipe(
      map(records => {
        if (records.length === 0) {
          return null;
        }

        const record = records[0];
        // Normalizar: quitar espacios, guiones bajos, prefijos P_ P 
        const normalize = (name: string): string => {
          let n = name.trim().toUpperCase();
          n = n.replace(/[_\s]+/g, ' ').trim(); // Unificar separadores
          return n;
        };

        const colorNormalizado = normalize(colorName);
        
        // Buscar el color en los datos con normalización
        const colorData = record.colores.find(c => 
          normalize(c.nombre) === colorNormalizado
        );

        return colorData || null;
      }),
      catchError(error => {
        console.error('Error obteniendo datos del color:', error);
        return of(null);
      })
    );
  }

  /**
   * Obtener todos los registros
   */
  getAll(): Observable<CodTintaRecord[]> {
    return this.http.get<CodTintaResponse>(`${this.apiUrl}`)
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          console.error('Error obteniendo códigos de tintas:', error);
          return of([]);
        })
      );
  }

  /**
   * Obtener registros paginados
   */
  getPaginated(page: number = 1, pageSize: number = 50, search?: string): Observable<any> {
    let url = `${this.apiUrl}/paginated?page=${page}&pageSize=${pageSize}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    return this.http.get<any>(url).pipe(
      catchError(error => {
        console.error('Error obteniendo códigos de tintas paginados:', error);
        return of({ items: [], totalCount: 0, page: 1, pageSize: 50, totalPages: 0 });
      })
    );
  }

  /**
   * Crear un nuevo registro
   */
  create(data: { articulo: string; descripcion: string; colores: ColorTintaData[] }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, data);
  }

  /**
   * Actualizar un registro
   */
  update(id: number, data: { descripcion: string; colores: ColorTintaData[] }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Eliminar un registro
   */
  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
