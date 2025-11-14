// =====================================================
// SERVICIO DE DOCUMENTOS - FLEXOAPP
// Propósito: Comunicación con el backend para gestión de documentos
// =====================================================

// Importar decorador Injectable de Angular para permitir inyección de dependencias
import { Injectable } from '@angular/core';
// Importar HttpClient para hacer peticiones HTTP al backend
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
// Importar Observable para manejar operaciones asíncronas
// Importar throwError para crear observables de error
import { Observable, throwError } from 'rxjs';
// Importar operadores de RxJS para transformar y manejar observables
import { catchError, map } from 'rxjs/operators';

// Importar el modelo de documento que define la estructura de datos
import { Documento } from '../../shared/models/documento.model';
// Importar configuración de entorno para obtener la URL del API
import { environment } from '../../../environments/environment';

// Decorador Injectable marca esta clase como un servicio inyectable
@Injectable({
  providedIn: 'root' // Servicio singleton disponible en toda la aplicación
})
export class DocumentoService {
  // URL base del API REST del backend
  // Se obtiene desde el archivo de configuración de entorno (environment.ts)
  // Puerto 7003 - Backend de FlexoAPP
  // Concatena la URL base del API con el endpoint de documentos
  private apiUrl = `${environment.apiUrl}/documentos`;

  // Constructor del servicio
  // @param http - Cliente HTTP de Angular para hacer peticiones al servidor
  constructor(private http: HttpClient) {}

  // ===== MÉTODOS CRUD (Create, Read, Update, Delete) =====

  /**
   * Obtener todos los documentos de la base de datos
   * @returns Observable con array de documentos
   */
  getAll(): Observable<Documento[]> {
    // Hacer petición GET al endpoint base del API
    return this.http.get<Documento[]>(this.apiUrl).pipe(
      // Capturar y manejar cualquier error que ocurra
      catchError(this.handleError)
    );
  }

  /**
   * Obtener un documento específico por su ID
   * @param id - ID único del documento a buscar
   * @returns Observable con el documento encontrado
   */
  getById(id: number): Observable<Documento> {
    // Hacer petición GET al endpoint con el ID del documento
    // Ejemplo: GET http://localhost:3000/api/documentos/5
    return this.http.get<Documento>(`${this.apiUrl}/${id}`).pipe(
      // Capturar y manejar cualquier error (ej: documento no encontrado)
      catchError(this.handleError)
    );
  }

  /**
   * Crear un nuevo documento en la base de datos
   * @param documento - Objeto con los datos del documento a crear
   * @returns Observable con el documento creado (incluye ID generado)
   */
  create(documento: Partial<Documento>): Observable<Documento> {
    // Hacer petición POST al endpoint base con los datos del documento
    // El servidor generará el ID y otros campos automáticos
    return this.http.post<Documento>(this.apiUrl, documento).pipe(
      // Capturar y manejar cualquier error (ej: validación fallida)
      catchError(this.handleError)
    );
  }

  /**
   * Actualizar un documento existente en la base de datos
   * @param id - ID del documento a actualizar
   * @param documento - Objeto con los campos a actualizar
   * @returns Observable con el documento actualizado
   */
  update(id: number, documento: Partial<Documento>): Observable<Documento> {
    // Hacer petición PUT al endpoint con el ID del documento
    // Solo se actualizan los campos enviados (Partial permite campos opcionales)
    // Ejemplo: PUT http://localhost:3000/api/documentos/5
    return this.http.put<Documento>(`${this.apiUrl}/${id}`, documento).pipe(
      // Capturar y manejar cualquier error (ej: documento no encontrado)
      catchError(this.handleError)
    );
  }

  /**
   * Eliminar un documento de la base de datos
   * @param id - ID del documento a eliminar
   * @returns Observable vacío (void) cuando se completa la eliminación
   */
  delete(id: number): Observable<void> {
    // Hacer petición DELETE al endpoint con el ID del documento
    // Ejemplo: DELETE http://localhost:3000/api/documentos/5
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      // Capturar y manejar cualquier error (ej: documento no encontrado)
      catchError(this.handleError)
    );
  }

  // ===== MÉTODOS DE SUBIDA DE ARCHIVOS =====

  /**
   * Subir un archivo de documento al servidor
   * @param file - Archivo a subir (File object del navegador)
   * @param metadata - Metadatos del documento (nombre, categoría, etc.)
   * @returns Observable con el documento creado (incluye URL del archivo)
   */
  uploadFile(file: File, metadata: Partial<Documento>): Observable<Documento> {
    // Crear objeto FormData para enviar archivo y datos en formato multipart/form-data
    const formData = new FormData();
    
    // Agregar el archivo al FormData con su nombre original
    // 'file' es el nombre del campo que espera el backend
    formData.append('file', file, file.name);
    
    // Agregar metadatos del documento al FormData
    // Usar || '' para evitar enviar undefined
    formData.append('nombre', metadata.nombre || '');           // Nombre del documento
    formData.append('categoria', metadata.categoria || '');     // Categoría del documento
    formData.append('estado', metadata.estado || 'draft');      // Estado (por defecto: draft)
    formData.append('descripcion', metadata.descripcion || ''); // Descripción del documento

    // Hacer petición POST al endpoint de upload con el FormData
    // El servidor procesará el archivo y lo guardará en el sistema de archivos
    // Ejemplo: POST http://localhost:3000/api/documentos/upload
    return this.http.post<Documento>(`${this.apiUrl}/upload`, formData).pipe(
      // Capturar y manejar cualquier error (ej: archivo muy grande, tipo no permitido)
      catchError(this.handleError)
    );
  }

  // ===== MÉTODOS DE BÚSQUEDA Y FILTRADO =====

  /**
   * Buscar documentos por término de búsqueda
   * Busca en nombre, descripción, etiquetas y palabras clave
   * @param term - Término de búsqueda a buscar
   * @returns Observable con array de documentos que coinciden
   */
  search(term: string): Observable<Documento[]> {
    // Crear parámetros HTTP para la query string
    // Ejemplo: ?q=reporte
    const params = new HttpParams().set('q', term);
    
    // Hacer petición GET al endpoint de búsqueda con los parámetros
    // Ejemplo: GET http://localhost:3000/api/documentos/search?q=reporte
    return this.http.get<Documento[]>(`${this.apiUrl}/search`, { params }).pipe(
      // Capturar y manejar cualquier error
      catchError(this.handleError)
    );
  }

  /**
   * Filtrar documentos por categoría
   * @param category - Categoría a filtrar (reportes, formatos, tecnicos, otros)
   * @returns Observable con array de documentos de esa categoría
   */
  filterByCategory(category: string): Observable<Documento[]> {
    // Crear parámetros HTTP con la categoría
    // Ejemplo: ?categoria=reportes
    const params = new HttpParams().set('categoria', category);
    
    // Hacer petición GET al endpoint de filtrado con los parámetros
    // Ejemplo: GET http://localhost:3000/api/documentos/filter?categoria=reportes
    return this.http.get<Documento[]>(`${this.apiUrl}/filter`, { params }).pipe(
      // Capturar y manejar cualquier error
      catchError(this.handleError)
    );
  }

  /**
   * Filtrar documentos por estado
   * @param status - Estado a filtrar (active, draft, archived)
   * @returns Observable con array de documentos con ese estado
   */
  filterByStatus(status: string): Observable<Documento[]> {
    // Crear parámetros HTTP con el estado
    // Ejemplo: ?estado=active
    const params = new HttpParams().set('estado', status);
    
    // Hacer petición GET al endpoint de filtrado con los parámetros
    // Ejemplo: GET http://localhost:3000/api/documentos/filter?estado=active
    return this.http.get<Documento[]>(`${this.apiUrl}/filter`, { params }).pipe(
      // Capturar y manejar cualquier error
      catchError(this.handleError)
    );
  }

  // ===== MÉTODOS DE ESTADÍSTICAS =====

  /**
   * Incrementar el contador de vistas de un documento
   * Se llama cuando un usuario visualiza el documento
   * @param id - ID del documento visualizado
   * @returns Observable vacío cuando se completa la operación
   */
  incrementViews(id: number): Observable<void> {
    // Hacer petición POST al endpoint de vistas
    // El backend ejecutará: UPDATE Documento SET NumeroVistas = NumeroVistas + 1
    // Ejemplo: POST http://localhost:3000/api/documentos/5/view
    return this.http.post<void>(`${this.apiUrl}/${id}/view`, {}).pipe(
      // Capturar y manejar cualquier error
      catchError(this.handleError)
    );
  }

  /**
   * Incrementar el contador de descargas de un documento
   * Se llama cuando un usuario descarga el documento
   * @param id - ID del documento descargado
   * @returns Observable vacío cuando se completa la operación
   */
  incrementDownloads(id: number): Observable<void> {
    // Hacer petición POST al endpoint de descargas
    // El backend ejecutará: UPDATE Documento SET NumeroDescargas = NumeroDescargas + 1
    // Ejemplo: POST http://localhost:3000/api/documentos/5/download
    return this.http.post<void>(`${this.apiUrl}/${id}/download`, {}).pipe(
      // Capturar y manejar cualquier error
      catchError(this.handleError)
    );
  }

  // ===== MANEJO DE ERRORES =====

  /**
   * Método privado para manejar errores HTTP de forma centralizada
   * Procesa errores del cliente y del servidor
   * @param error - Objeto de error HTTP
   * @returns Observable que emite un error
   */
  private handleError(error: any): Observable<never> {
    // Variable para almacenar el mensaje de error
    let errorMessage = 'Ocurrió un error desconocido';
    
    // Verificar si el error es del lado del cliente (red, etc.)
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente (ej: sin conexión a internet)
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor (ej: 404, 500, etc.)
      // Construir mensaje con código de estado HTTP y mensaje
      errorMessage = `Código de error: ${error.status}\nMensaje: ${error.message}`;
    }
    
    // Registrar el error en la consola para debugging
    console.error(errorMessage);
    
    // Retornar un observable que emite el error
    // throwError crea un observable que inmediatamente emite un error
    return throwError(() => new Error(errorMessage));
  }
}

