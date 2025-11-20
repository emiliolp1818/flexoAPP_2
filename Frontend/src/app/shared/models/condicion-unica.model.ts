// ===== MODELO DE CONDICIÓN ÚNICA =====
// Interfaz TypeScript que define la estructura de datos para Condición Única
// Este modelo representa un registro en la base de datos condicionunica

/**
 * Interface CondicionUnica
 * Define la estructura de datos para el sistema de Condición Única
 * Cada registro contiene información sobre artículos, referencias y ubicación física
 */
export interface CondicionUnica {
  // ID único del registro (autoincremental en base de datos)
  id?: number;
  
  // Código del artículo F (ejemplo: F204567)
  // Campo requerido para identificar el artículo
  fArticulo: string;
  
  // Referencia del producto o diseño
  // Información adicional sobre el artículo
  referencia: string;
  
  // Número de estante donde se encuentra físicamente
  // Ubicación en el almacén o área de producción
  estante: string;
  
  // Número de carpeta donde está archivado
  // Organización documental del artículo
  numeroCarpeta: string;
  
  // Fecha de creación del registro (opcional)
  // Se genera automáticamente al crear el registro
  createdDate?: Date;
  
  // Fecha de última modificación (opcional)
  // Se actualiza automáticamente al editar el registro
  lastModified?: Date;
}
