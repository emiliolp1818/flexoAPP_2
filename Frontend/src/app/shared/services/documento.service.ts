





import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';


import { Observable, throwError } from 'rxjs';

import { catchError, map } from 'rxjs/operators';


import { Documento } from '../../shared/models/documento.model';

import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class DocumentoService {




  private apiUrl = `${environment.apiUrl}/documentos`;



  constructor(private http: HttpClient) {}




  getAll(): Observable<Documento[]> {

    return this.http.get<Documento[]>(this.apiUrl).pipe(

      catchError(this.handleError)
    );
  }


  getById(id: number): Observable<Documento> {


    return this.http.get<Documento>(`${this.apiUrl}/${id}`).pipe(

      catchError(this.handleError)
    );
  }


  create(documento: Partial<Documento>): Observable<Documento> {


    return this.http.post<Documento>(this.apiUrl, documento).pipe(

      catchError(this.handleError)
    );
  }


  update(id: number, documento: Partial<Documento>): Observable<Documento> {



    return this.http.put<Documento>(`${this.apiUrl}/${id}`, documento).pipe(

      catchError(this.handleError)
    );
  }


  delete(id: number): Observable<void> {


    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(

      catchError(this.handleError)
    );
  }




  uploadFile(file: File, metadata: Partial<Documento>): Observable<Documento> {

    const formData = new FormData();



    formData.append('file', file, file.name);



    formData.append('nombre', metadata.nombre || '');
    formData.append('categoria', metadata.categoria || '');
    formData.append('estado', metadata.estado || 'draft');
    formData.append('descripcion', metadata.descripcion || '');




    return this.http.post<Documento>(`${this.apiUrl}/upload`, formData).pipe(

      catchError(this.handleError)
    );
  }




  search(term: string): Observable<Documento[]> {


    const params = new HttpParams().set('q', term);



    return this.http.get<Documento[]>(`${this.apiUrl}/search`, { params }).pipe(

      catchError(this.handleError)
    );
  }


  filterByCategory(category: string): Observable<Documento[]> {


    const params = new HttpParams().set('categoria', category);



    return this.http.get<Documento[]>(`${this.apiUrl}/filter`, { params }).pipe(

      catchError(this.handleError)
    );
  }


  filterByStatus(status: string): Observable<Documento[]> {


    const params = new HttpParams().set('estado', status);



    return this.http.get<Documento[]>(`${this.apiUrl}/filter`, { params }).pipe(

      catchError(this.handleError)
    );
  }




  incrementViews(id: number): Observable<void> {



    return this.http.post<void>(`${this.apiUrl}/${id}/view`, {}).pipe(

      catchError(this.handleError)
    );
  }


  incrementDownloads(id: number): Observable<void> {



    return this.http.post<void>(`${this.apiUrl}/${id}/download`, {}).pipe(

      catchError(this.handleError)
    );
  }




  private handleError(error: any): Observable<never> {

    let errorMessage = 'Ocurrió un error desconocido';


    if (error.error instanceof ErrorEvent) {

      errorMessage = `Error: ${error.error.message}`;
    } else {


      errorMessage = `Código de error: ${error.status}\nMensaje: ${error.message}`;
    }


    console.error(errorMessage);



    return throwError(() => new Error(errorMessage));
  }
}

