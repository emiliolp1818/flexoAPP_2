// ===== SERVICIO DE CONDICIÓN ÚNICA =====
// Servicio Angular para gestionar operaciones CRUD de Condición Única
// Maneja la comunicación con el backend API para la base de datos condicionunica

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CondicionUnica } from '../models/condicion-unica.model';

/**
 * Servicio CondicionUnicaService
 * Proporciona métodos para interactuar con la API de Condición Única
 * Incluye operaciones CRUD completas y búsqueda por F Artículo
 */
@Injectable({
  providedIn: 'root' // Servicio singleton disponible en toda la aplicación
})
export class CondicionUnicaService {
  // Inyección del cliente HTTP para realizar peticiones al backend
  private http = inject(HttpClient);
  
  // URL base de la API obtenida desde el archivo de environment
  // Ejemplo: http://localhost:7003/api o https://flexoapp-backend.onrender.com/api
  private apiUrl = `${environment.apiUrl}/condicion-unica`;

  /**
   * Obtener todos los registros de Condición Única
   * @returns Observable con array de CondicionUnica
   * Endpoint: GET /api/condicion-unica
   */
  getAll(): Observable<CondicionUnica[]> {
    return this.http.get<CondicionUnica[]>(this.apiUrl);
  }

  /**
   * Obtener un registro específico por ID
   * @param id - ID del registro a buscar
   * @returns Observable con el registro encontrado
   * Endpoint: GET /api/condicion-unica/{id}
   */
  getById(id: number): Observable<CondicionUnica> {
    return this.http.get<CondicionUnica>(`${this.apiUrl}/${id}`);
  }

  /**
   * Buscar registros por F Artículo
   * @param fArticulo - Código del artículo F a buscar
   * @returns Observable con array de registros que coinciden
   * Endpoint: GET /api/condicion-unica/search?fArticulo={fArticulo}
   */
  searchByFArticulo(fArticulo: string): Observable<CondicionUnica[]> {
    return this.http.get<CondicionUnica[]>(`${this.apiUrl}/search`, {
      params: { fArticulo }
    });
  }

  /**
   * Crear un nuevo registro de Condición Única
   * @param condicion - Datos del nuevo registro
   * @returns Observable con el registro creado (incluye ID generado)
   * Endpoint: POST /api/condicion-unica
   */
  create(condicion: CondicionUnica): Observable<CondicionUnica> {
    return this.http.post<CondicionUnica>(this.apiUrl, condicion);
  }

  /**
   * Actualizar un registro existente
   * @param id - ID del registro a actualizar
   * @param condicion - Datos actualizados
   * @returns Observable con el registro actualizado
   * Endpoint: PUT /api/condicion-unica/{id}
   */
  update(id: number, condicion: CondicionUnica): Observable<CondicionUnica> {
    return this.http.put<CondicionUnica>(`${this.apiUrl}/${id}`, condicion);
  }

  /**
   * Eliminar un registro
   * @param id - ID del registro a eliminar
   * @returns Observable con confirmación de eliminación
   * Endpoint: DELETE /api/condicion-unica/{id}
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
