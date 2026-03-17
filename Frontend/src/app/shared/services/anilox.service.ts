import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


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


  getAll(): Observable<Anilox[]> {
    return this.http.get<Anilox[]>(this.apiUrl);
  }


  getByMachine(machineNumber: number): Observable<Anilox[]> {
    return this.http.get<Anilox[]>(`${this.apiUrl}/machine/${machineNumber}`);
  }


  getUniqueLineaturas(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/lineaturas`);
  }


  getByLineatura(lineatura: number): Observable<Anilox[]> {
    const url = `${this.apiUrl}/lineatura/${lineatura}`;
    console.log(`🔵 AniloxService.getByLineatura - URL: ${url}`);
    return this.http.get<Anilox[]>(url);
  }


  getByBCM(bcm: number): Observable<Anilox[]> {
    const url = `${this.apiUrl}/bcm/${bcm}`;
    console.log(`🔵 AniloxService.getByBCM - URL: ${url}`);
    return this.http.get<Anilox[]>(url);
  }


  getByLineaturaAndMachine(lineatura: number, machineNumber: number): Observable<Anilox[]> {
    return this.http.get<Anilox[]>(`${this.apiUrl}/lineatura/${lineatura}/machine/${machineNumber}`);
  }


  create(data: CreateAniloxDto): Observable<Anilox> {
    return this.http.post<Anilox>(this.apiUrl, data);
  }


  update(id: number, data: UpdateAniloxDto): Observable<Anilox> {
    return this.http.put<Anilox>(`${this.apiUrl}/${id}`, data);
  }


  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


  importFromExcel(aniloxList: CreateAniloxDto[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/import`, aniloxList);
  }
}
