import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface MachineConfig {
  id: number;
  numero_maquina: number;
  carga_muestra?: number;
}

@Injectable({
  providedIn: 'root'
})
export class MachineConfigService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/machineconfig`;

  // Obtener todas las configuraciones de máquinas
  getAll(): Observable<MachineConfig[]> {
    return this.http.get<MachineConfig[]>(this.apiUrl);
  }

  // Obtener configuración de una máquina específica
  getByMachine(numeroMaquina: number): Observable<MachineConfig> {
    return this.http.get<MachineConfig>(`${this.apiUrl}/${numeroMaquina}`);
  }

  // Actualizar carga muestra de una máquina
  updateCargaMuestra(numeroMaquina: number, cargaMuestra: number | null): Observable<any> {
    const url = `${this.apiUrl}/${numeroMaquina}/carga-muestra`;
    const body = { cargaMuestra: cargaMuestra };
    
    console.log('🔵 ===== MachineConfigService.updateCargaMuestra =====');
    console.log('📤 URL:', url);
    console.log('📤 Body:', body);
    console.log('📤 Número máquina:', numeroMaquina);
    console.log('📤 Carga muestra:', cargaMuestra);
    
    return this.http.put(url, body);
  }
}
