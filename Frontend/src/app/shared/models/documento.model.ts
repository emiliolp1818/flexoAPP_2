// =====================================================
// MODELO DE DOCUMENTO - FLEXOAPP
// Propósito: Definir la estructura de datos de un documento
// =====================================================

// Interfaz que define la estructura completa de un documento
// Corresponde a la tabla Documento en MySQL
export interface Documento {
  // ===== IDENTIFICACIÓN =====
  documentoID?: number;                            // ID único del documento (opcional al crear, generado por BD)
  
  // ===== INFORMACIÓN BÁSICA =====
  nombre: string;                                  // Nombre descriptivo del documento (requerido)
  tipo: string;                                    // Tipo de documento: PDF, Word, Excel, Image, Video
  categoria: string;                               // Categoría: reportes, formatos, tecnicos, otros
  descripcion?: string;                            // Descripción detallada del documento (opcional)
  
  // ===== INFORMACIÓN DEL ARCHIVO =====
  nombreArchivo?: string;                          // Nombre del archivo físico almacenado
  rutaArchivo?: string;                            // Ruta o URL donde se encuentra el archivo
  tamanoBytes?: number;                            // Tamaño del archivo en bytes
  tamanoFormateado?: string;                       // Tamaño formateado legible (ej: "2.5 MB")
  extension?: string;                              // Extensión del archivo (pdf, docx, xlsx, etc.)
  hashMD5?: string;                                // Hash MD5 para verificación de integridad
  
  // ===== ESTADO Y CONTROL =====
  estado: 'active' | 'draft' | 'archived';        // Estado del documento (requerido)
  version?: string;                                // Versión del documento (ej: "1.0", "2.1")
  
  // ===== METADATOS =====
  etiquetas?: string;                              // Etiquetas separadas por comas para búsqueda
  palabrasClave?: string;                          // Palabras clave para búsqueda de texto completo
  
  // ===== AUDITORÍA =====
  creadoPor?: string;                              // Usuario que creó el documento
  fechaCreacion?: Date;                            // Fecha y hora de creación
  modificadoPor?: string;                          // Usuario que modificó por última vez
  fechaModificacion?: Date;                        // Fecha y hora de última modificación
  
  // ===== CONTROL DE ACCESO =====
  esPublico?: boolean;                             // Indica si el documento es público (true) o privado (false)
  nivelAcceso?: number;                            // Nivel de acceso requerido: 0=público, 1=usuario, 2=admin
  
  // ===== ESTADÍSTICAS =====
  numeroVistas?: number;                           // Contador de visualizaciones del documento
  numeroDescargas?: number;                        // Contador de descargas del documento
  fechaUltimoAcceso?: Date;                        // Fecha del último acceso al documento
}

// Interfaz para crear un nuevo documento (campos mínimos requeridos)
export interface DocumentoCreate {
  nombre: string;                                  // Nombre del documento (requerido)
  tipo: string;                                    // Tipo de documento (requerido)
  categoria: string;                               // Categoría del documento (requerido)
  estado: 'active' | 'draft' | 'archived';        // Estado del documento (requerido)
  descripcion?: string;                            // Descripción opcional
  rutaArchivo?: string;                            // URL opcional del documento
}

// Interfaz para actualizar un documento existente (todos los campos opcionales)
export interface DocumentoUpdate {
  nombre?: string;                                 // Nuevo nombre del documento
  tipo?: string;                                   // Nuevo tipo de documento
  categoria?: string;                              // Nueva categoría
  estado?: 'active' | 'draft' | 'archived';       // Nuevo estado
  descripcion?: string;                            // Nueva descripción
  rutaArchivo?: string;                            // Nueva URL
  version?: string;                                // Nueva versión
}

// Interfaz para filtros de búsqueda
export interface DocumentoFilter {
  categoria?: string;                              // Filtrar por categoría
  estado?: 'active' | 'draft' | 'archived';       // Filtrar por estado
  tipo?: string;                                   // Filtrar por tipo
  busqueda?: string;                               // Término de búsqueda
  fechaDesde?: Date;                               // Filtrar desde fecha
  fechaHasta?: Date;                               // Filtrar hasta fecha
}

// Interfaz para respuesta del servidor con paginación
export interface DocumentoResponse {
  documentos: Documento[];                         // Array de documentos
  total: number;                                   // Total de documentos (para paginación)
  pagina: number;                                  // Página actual
  porPagina: number;                               // Documentos por página
}
