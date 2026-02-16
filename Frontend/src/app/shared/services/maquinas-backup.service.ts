import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MaquinaBackup {
  backupId: number;
  otSap: string;
  articulo: string;
  numeroMaquina: number;
  cliente: string;
  referencia?: string;
  td?: string;
  tipoImpresion?: string;
  numeroColores: number;
  colores: string;
  kilos: number;
  metros?: number;
  fechaTintaEnMaquina: Date;
  sustrato: string;
  estado?: string;
  observaciones?: string;
  lastActionBy?: string;
  lastActionAt?: Date;
  preparandoStartedAt?: Date;
  createdBy?: number;
  updatedBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  backupDate: Date;
  backupReason: string;
  backupUserId?: number;
  backupUserName?: string;
}

export interface BackupSearchResponse {
  data: MaquinaBackup[];
  totalRecords: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BackupStats {
  totalBackups: number;
  articulosUnicos: number;
  maquinasUsadas: number;
  backupMasAntiguo?: Date;
  backupMasReciente?: Date;
  backupReason: string;
  countByReason: number;
}

@Injectable({
  providedIn: 'root'
})
export class MaquinasBackupService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/maquinasbackup`;


  searchBackup(filters: {
    articulo?: string;
    otSap?: string;
    cliente?: string;
    numeroMaquina?: number;
    fechaDesde?: Date;
    fechaHasta?: Date;
    estado?: string;
    page?: number;
    pageSize?: number;
  }): Observable<BackupSearchResponse> {
    let params = new HttpParams();

    if (filters.articulo) params = params.set('articulo', filters.articulo);
    if (filters.otSap) params = params.set('otSap', filters.otSap);
    if (filters.cliente) params = params.set('cliente', filters.cliente);
    if (filters.numeroMaquina) params = params.set('numeroMaquina', filters.numeroMaquina.toString());
    if (filters.fechaDesde) params = params.set('fechaDesde', filters.fechaDesde.toISOString());
    if (filters.fechaHasta) params = params.set('fechaHasta', filters.fechaHasta.toISOString());
    if (filters.estado) params = params.set('estado', filters.estado);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.pageSize) params = params.set('pageSize', filters.pageSize.toString());

    return this.http.get<BackupSearchResponse>(`${this.apiUrl}/search`, { params });
  }


  createBackup(otSap: string, reason: string, userId?: number, userName?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, {
      otSap,
      reason,
      userId,
      userName
    });
  }


  createBackupByEstado(estado: string, userId?: number, userName?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-by-estado`, {
      estado,
      userId,
      userName
    });
  }


  getStats(): Observable<BackupStats[]> {
    return this.http.get<BackupStats[]>(`${this.apiUrl}/stats`);
  }
}
