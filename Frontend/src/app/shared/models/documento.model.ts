






export interface Documento {

  documentoID?: number;


  nombre: string;
  tipo: string;
  categoria: string;
  descripcion?: string;


  nombreArchivo?: string;
  rutaArchivo?: string;
  tamanoBytes?: number;
  tamanoFormateado?: string;
  extension?: string;
  hashMD5?: string;


  estado: 'active' | 'draft' | 'archived';
  version?: string;


  etiquetas?: string;
  palabrasClave?: string;


  creadoPor?: string;
  fechaCreacion?: Date;
  modificadoPor?: string;
  fechaModificacion?: Date;


  esPublico?: boolean;
  nivelAcceso?: number;


  numeroVistas?: number;
  numeroDescargas?: number;
  fechaUltimoAcceso?: Date;
}


export interface DocumentoCreate {
  nombre: string;
  tipo: string;
  categoria: string;
  estado: 'active' | 'draft' | 'archived';
  descripcion?: string;
  rutaArchivo?: string;
}


export interface DocumentoUpdate {
  nombre?: string;
  tipo?: string;
  categoria?: string;
  estado?: 'active' | 'draft' | 'archived';
  descripcion?: string;
  rutaArchivo?: string;
  version?: string;
}


export interface DocumentoFilter {
  categoria?: string;
  estado?: 'active' | 'draft' | 'archived';
  tipo?: string;
  busqueda?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
}


export interface DocumentoResponse {
  documentos: Documento[];
  total: number;
  pagina: number;
  porPagina: number;
}
