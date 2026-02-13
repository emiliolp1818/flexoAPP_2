import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Interfaz para el modelo de Anilox
export interface Anilox {
  id: number;
  codigo: string;
  maquina: number;
  bcm: number;
  lineatura: number;
  marca: string;
  volumen_real: number;
  factor_eficiencia?: number;
  densidad?: number;
  created_at?: Date;
  updated_at?: Date;
}

// DTOs para crear y actualizar
export interface CreateAniloxDto {
  codigo: string;
  maquina: number;
  bcm: number;
  lineatura: number;
  marca: string;
  volumen_real: number;
  factor_eficiencia?: number;
  densidad?: number;
}

export interface UpdateAniloxDto {
  codigo?: string;
  maquina?: number;
  bcm?: number;
  lineatura?: number;
  marca?: string;
  volumen_real?: number;
  factor_eficiencia?: number;
  densidad?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AniloxService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/anilox`;

  // Obtener todos los anilox
  getAll(): Observable<Anilox[]> {
    return this.http.get<Anilox[]>(this.apiUrl);
  }

  // Obtener anilox por máquina
  getByMachine(machineNumber: number): Observable<Anilox[]> {
    return this.http.get<Anilox[]>(`${this.apiUrl}/machine/${machineNumber}`);
  }

  // Obtener lineaturas únicas
  getUniqueLineaturas(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/lineaturas`);
  }

  // Obtener anilox por lineatura
  getByLineatura(lineatura: number): Observable<Anilox[]> {
    const url = `${this.apiUrl}/lineatura/${lineatura}`;
    console.log(`🔵 AniloxService.getByLineatura - URL: ${url}`);
    return this.http.get<Anilox[]>(url);
  }

  // Obtener anilox por BCM
  getByBCM(bcm: number): Observable<Anilox[]> {
    const url = `${this.apiUrl}/bcm/${bcm}`;
    console.log(`🔵 AniloxService.getByBCM - URL: ${url}`);
    return this.http.get<Anilox[]>(url);
  }

  // Obtener anilox por lineatura y máquina
  getByLineaturaAndMachine(lineatura: number, machineNumber: number): Observable<Anilox[]> {
    return this.http.get<Anilox[]>(`${this.apiUrl}/lineatura/${lineatura}/machine/${machineNumber}`);
  }

  // Crear anilox (para el módulo de diseño)
  create(data: CreateAniloxDto): Observable<Anilox> {
    return this.http.post<Anilox>(this.apiUrl, data);
  }

  // Actualizar anilox (para el módulo de diseño)
  update(id: number, data: UpdateAniloxDto): Observable<Anilox> {
    return this.http.put<Anilox>(`${this.apiUrl}/${id}`, data);
  }

  // Eliminar anilox (para el módulo de diseño)
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Importar desde Excel (para el módulo de diseño)
  importFromExcel(aniloxList: CreateAniloxDto[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/import`, aniloxList);
  }
}
