// ===== MODELO DE CONDICIÓN ÚNICA =====
// Interfaz TypeScript que define la estructura de datos para Condición Única
// Este modelo representa un registro en la base de datos condicionunica

/**
 * Interface CondicionUnica
 * Define la estructura de datos para el sistema de Condición Única
 * Cada registro contiene información sobre artículos, descripción y ubicación física
 */
export interface CondicionUnica {
  // ID único del registro (autoincremental en base de datos)
  // Campo opcional porque se genera automáticamente al crear el registro
  id?: number;
  
  // Código del artículo F (ejemplo: F204567)
  // Campo requerido para identificar el artículo de forma única
  fArticulo: string;
  
  // Descripción del producto o diseño
  // Este campo se carga automáticamente desde la tabla designs si el artículo existe
  // Si no existe en designs, se ingresa manualmente
  descripcion: string;
  
  // Número de estante donde se encuentra físicamente el artículo
  // Ubicación en el almacén o área de producción para localización rápida
  estante: string;
  
  // Número de carpeta donde está archivado el documento del artículo
  // Organización documental del artículo para gestión de archivos físicos
  numeroCarpeta: string;
  
  // Fecha de creación del registro (opcional)
  // Se genera automáticamente al crear el registro en la base de datos
  createdDate?: Date;
  
  // Fecha de última modificación (opcional)
  // Se actualiza automáticamente al editar el registro en la base de datos
  lastModified?: Date;
}
