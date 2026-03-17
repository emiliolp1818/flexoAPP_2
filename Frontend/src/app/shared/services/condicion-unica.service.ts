



import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CondicionUnica } from '../models/condicion-unica.model';


@Injectable({
  providedIn: 'root'
})
export class CondicionUnicaService {

  private http = inject(HttpClient);



  private apiUrl = `${environment.apiUrl}/condicion-unica`;


  getAll(): Observable<CondicionUnica[]> {
    return this.http.get<CondicionUnica[]>(this.apiUrl);
  }


  getById(id: number): Observable<CondicionUnica> {
    return this.http.get<CondicionUnica>(`${this.apiUrl}/${id}`);
  }


  searchByFArticulo(fArticulo: string): Observable<CondicionUnica[]> {
    return this.http.get<CondicionUnica[]>(`${this.apiUrl}/search`, {
      params: { fArticulo }
    });
  }


  create(condicion: CondicionUnica): Observable<CondicionUnica> {
    return this.http.post<CondicionUnica>(this.apiUrl, condicion);
  }


  update(id: number, condicion: CondicionUnica): Observable<CondicionUnica> {
    return this.http.put<CondicionUnica>(`${this.apiUrl}/${id}`, condicion);
  }


  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
