// =====================================================
// COMPONENTE DE GESTIÓN DE DOCUMENTOS - FLEXOAPP
// Propósito: Gestionar documentos del sistema
// =====================================================

// Importar decorador Component y funciones de signals de Angular
import { Component, signal, computed, OnInit } from '@angular/core';
// Importar módulo común de Angular para directivas básicas
import { CommonModule } from '@angular/common';
// Importar módulo de formularios para ngModel
import { FormsModule } from '@angular/forms';
// Importar módulos de Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
// Importar HttpClientModule para hacer peticiones HTTP
import { HttpClientModule } from '@angular/common/http';
// Importar componentes de diálogos personalizados
import { UploadDocumentoDialogComponent } from './dialogs/upload-documento-dialog';
import { CreateDocumentoDialogComponent } from './dialogs/create-documento-dialog';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog';
import { PdfViewerDialogComponent } from './dialogs/pdf-viewer-dialog';
// Importar servicio de documentos para comunicación con backend
import { DocumentoService } from '../../services/documento.service';
// Importar modelo de documento
import { Documento } from '../../models/documento.model';
// Importar configuración de entorno
import { environment } from '../../../../environments/environment';

// NOTA: La interfaz Document se reemplaza por el modelo Documento importado
// que tiene la estructura completa de la base de datos

// Decorador del componente con configuración
@Component({
  selector: 'app-documento',                       // Selector para usar el componente en HTML
  standalone: true,                                // Componente standalone (sin módulo)
  imports: [                                       // Módulos importados para usar en el componente
    CommonModule,                                  // Directivas comunes (ngIf, ngFor, etc.)
    FormsModule,                                   // Para usar ngModel en formularios
    MatCardModule,                                 // Tarjetas de Material
    MatButtonModule,                               // Botones de Material
    MatIconModule,                                 // Iconos de Material
    MatTableModule,                                // Tablas de Material
    MatFormFieldModule,                            // Campos de formulario de Material
    MatInputModule,                                // Inputs de Material
    MatSelectModule,                               // Selectores de Material
    MatTooltipModule,                              // Tooltips de Material
    MatSnackBarModule,                             // Notificaciones de Material
    MatDialogModule,                               // Diálogos de Material
    HttpClientModule                               // Módulo HTTP para peticiones al backend
  ],
  templateUrl: './documento.html',                 // Ruta del template HTML
  styleUrls: ['./documento.scss']                  // Ruta de los estilos SCSS
})
export class DocumentoComponent implements OnInit {
  // ===== SIGNALS PARA ESTADO REACTIVO =====
  // Signals permiten reactividad automática en Angular 17+
  
  // Lista de todos los documentos (inicialmente vacía, se cargará de BD)
  documents = signal<Documento[]>([]);
  
  // Signal para controlar el estado de carga
  loading = signal<boolean>(true);

  // Filtros de búsqueda
  searchTerm = signal<string>('');                 // Término de búsqueda ingresado por el usuario
  selectedCategory = signal<string>('all');        // Categoría seleccionada en el filtro
  selectedStatus = signal<string>('all');          // Estado seleccionado en el filtro

  // ===== COMPUTED SIGNALS =====
  // Se recalculan automáticamente cuando cambian sus dependencias
  
  // Documentos filtrados según los criterios de búsqueda
  filteredDocuments = computed(() => {
    let filtered = this.documents();               // Obtener todos los documentos

    // Filtrar por término de búsqueda (nombre o tipo)
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase(); // Convertir a minúsculas para búsqueda case-insensitive
      filtered = filtered.filter(doc =>
        doc.nombre.toLowerCase().includes(term) ||   // Buscar en el nombre
        doc.tipo.toLowerCase().includes(term)        // Buscar en el tipo
      );
    }

    // Filtrar por categoría seleccionada
    if (this.selectedCategory() !== 'all') {
      filtered = filtered.filter(doc => doc.categoria === this.selectedCategory());
    }

    // Filtrar por estado seleccionado
    if (this.selectedStatus() !== 'all') {
      filtered = filtered.filter(doc => doc.estado === this.selectedStatus());
    }

    return filtered;                               // Retornar documentos filtrados
  });

  // ===== OPCIONES DE FILTROS =====
  
  // Categorías disponibles para filtrar (actualizadas según requerimiento)
  categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'reportes', label: 'Reportes' },
    { value: 'formatos', label: 'Formatos' },
    { value: 'tecnicos', label: 'Técnicos' },
    { value: 'otros', label: 'Otros' }
  ];

  // Estados disponibles para filtrar
  statuses = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activos' },
    { value: 'draft', label: 'Borradores' },
    { value: 'archived', label: 'Archivados' }
  ];

  // Columnas a mostrar en la tabla (agregadas: category y description)
  displayedColumns: string[] = ['name', 'type', 'category', 'description', 'size', 'createdDate', 'status', 'actions'];

  // ===== CONSTRUCTOR =====
  // Inyectar servicios necesarios
  constructor(
    private snackBar: MatSnackBar,                 // Servicio para mostrar notificaciones
    private dialog: MatDialog,                     // Servicio para abrir diálogos modales
    private documentoService: DocumentoService     // Servicio para comunicación con backend
  ) {}

  // ===== LIFECYCLE HOOK =====
  // Se ejecuta al inicializar el componente
  ngOnInit(): void {
    this.loadDocuments();                          // Cargar documentos al iniciar
  }

  // ===== MÉTODOS DE CARGA DE DATOS =====
  
  /**
   * Cargar documentos desde la base de datos
   * Hace petición GET al backend para obtener todos los documentos
   */
  private loadDocuments(): void {
    this.loading.set(true);                        // Activar indicador de carga
    
    // Llamar al servicio para obtener todos los documentos
    this.documentoService.getAll().subscribe({
      // Callback cuando la petición es exitosa
      next: (documentos) => {
        this.documents.set(documentos);            // Actualizar signal con documentos de BD
        this.loading.set(false);                   // Desactivar indicador de carga
      },
      // Callback cuando ocurre un error
      error: (error) => {
        // Log solo en modo desarrollo
        if (!environment.production) {
          console.error('✗ Error al cargar documentos:', error);
        }
        // Mostrar mensaje personalizado al usuario
        this.showMessage('✗ Error al cargar documentos. Por favor, intente nuevamente.');
        this.loading.set(false);                   // Desactivar indicador de carga
        this.documents.set([]);                    // Dejar lista vacía en caso de error
      }
    });
  }

  // ===== MÉTODOS DE FILTRADO =====
  
  // Actualizar término de búsqueda cuando el usuario escribe
  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement; // Obtener el elemento input
    this.searchTerm.set(input.value);              // Actualizar el signal con el nuevo valor
  }

  // Cambiar categoría seleccionada en el filtro
  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);           // Actualizar el signal de categoría
  }

  // Cambiar estado seleccionado en el filtro
  onStatusChange(status: string): void {
    this.selectedStatus.set(status);               // Actualizar el signal de estado
  }

  // ===== MÉTODOS DE ACCIONES =====
  
  // Abrir diálogo para subir nuevo documento
  uploadDocument(): void {
    // Abrir diálogo modal de subida de archivos
    const dialogRef = this.dialog.open(UploadDocumentoDialogComponent, {
      width: '600px',                              // Ancho del diálogo
      disableClose: false                          // Permitir cerrar haciendo clic fuera
    });

    // Suscribirse al cierre del diálogo para obtener el resultado
    dialogRef.afterClosed().subscribe(result => {
      if (result) {                                // Si el usuario confirmó la subida
        // Preparar metadatos del documento para enviar al backend
        const metadata: Partial<Documento> = {
          nombre: result.name,                     // Nombre del documento
          tipo: this.getFileType(result.file.name), // Detectar tipo desde extensión
          categoria: result.category,              // Categoría seleccionada
          estado: result.status,                   // Estado seleccionado
          descripcion: result.description          // Descripción del documento
        };

        // Llamar al servicio para subir el archivo al backend
        this.documentoService.uploadFile(result.file, metadata).subscribe({
          // Callback cuando la subida es exitosa
          next: (documentoCreado) => {
            // Mostrar mensaje de confirmación personalizado
            this.showMessage(`✓ Documento "${documentoCreado.nombre}" subido correctamente`);
            
            // Recargar la lista completa de documentos desde la base de datos
            this.loadDocuments();
          },
          // Callback cuando ocurre un error
          error: (error) => {
            // Log solo en modo desarrollo
            if (!environment.production) {
              console.error('✗ Error al subir documento:', error);
            }
            // Mostrar mensaje personalizado al usuario
            this.showMessage('✗ Error al subir el documento. Por favor, intente nuevamente.');
            
            // Recargar la lista por si el documento se guardó en BD pero hubo error en la respuesta
            this.loadDocuments();
          }
        });
      }
    });
  }

  // Abrir diálogo para crear nuevo documento
  createNewDocument(): void {
    // Abrir diálogo modal de creación de documentos
    const dialogRef = this.dialog.open(CreateDocumentoDialogComponent, {
      width: '600px',                              // Ancho del diálogo
      disableClose: false                          // Permitir cerrar haciendo clic fuera
    });

    // Suscribirse al cierre del diálogo para obtener el resultado
    dialogRef.afterClosed().subscribe(result => {
      if (result) {                                // Si el usuario confirmó la creación
        // Preparar datos del documento para enviar al backend
        const nuevoDocumento: Partial<Documento> = {
          nombre: result.name,                     // Nombre del documento
          tipo: result.type,                       // Tipo seleccionado
          categoria: result.category,              // Categoría seleccionada
          estado: result.status,                   // Estado seleccionado
          descripcion: result.description,         // Descripción del documento
          rutaArchivo: result.url,                 // URL opcional
          tamanoFormateado: result.size            // Tamaño formateado
        };

        // Llamar al servicio para crear el documento en el backend
        this.documentoService.create(nuevoDocumento).subscribe({
          // Callback cuando la creación es exitosa
          next: (documentoCreado) => {
            // Mostrar mensaje de confirmación personalizado
            this.showMessage(`✓ Documento "${documentoCreado.nombre}" creado correctamente`);
            
            // Recargar la lista completa de documentos desde la base de datos
            this.loadDocuments();
          },
          // Callback cuando ocurre un error
          error: (error) => {
            // Log solo en modo desarrollo
            if (!environment.production) {
              console.error('✗ Error al crear documento:', error);
            }
            // Mostrar mensaje personalizado al usuario
            this.showMessage('✗ Error al crear el documento. Por favor, intente nuevamente.');
          }
        });
      }
    });
  }

  /**
   * Ver documento en ventana emergente (popup)
   * @param document - Documento a visualizar
   */
  viewDocument(document: Documento): void {
    // Si el documento tiene URL, abrirlo en ventana emergente
    if (document.rutaArchivo) {
      // Validar que la ruta no sea base64 (error común)
      if (document.rutaArchivo.includes('base64')) {
        // Log solo en modo desarrollo
        if (!environment.production) {
          console.error('❌ Error: La ruta del archivo contiene base64');
        }
        // Mostrar mensaje personalizado al usuario
        this.showMessage('✗ Error: El documento no tiene una URL válida');
        return;
      }

      // Construir URL completa del archivo usando la configuración del environment
      // La ruta en BD es relativa (/uploads/documentos/archivo.pdf)
      // Obtenemos la URL base del backend desde environment (sin /api)
      const backendUrl = environment.apiUrl.replace('/api', '');
      const fileUrl = document.rutaArchivo.startsWith('http') 
        ? document.rutaArchivo 
        : `${backendUrl}${document.rutaArchivo}`;
      
      // Log para debugging (solo en modo desarrollo)
      if (!environment.production) {
        console.log('📄 Abriendo documento:', {
          nombre: document.nombre,
          tipo: document.tipo,
          urlCompleta: fileUrl
        });
      }
      
      // Verificar que la URL es válida
      try {
        new URL(fileUrl);
      } catch (error) {
        // Log solo en modo desarrollo
        if (!environment.production) {
          console.error('❌ URL inválida:', fileUrl);
        }
        // Mostrar mensaje personalizado al usuario
        this.showMessage('✗ Error: URL del documento inválida');
        return;
      }
      
      // ===== VISUALIZACIÓN UNIFICADA EN PDF =====
      // Todos los archivos se convierten a PDF en el backend para vista previa
      
      // Construir URL del endpoint de conversión a PDF
      const pdfUrl = `${environment.apiUrl}/documentos/${document.documentoID}/pdf`;
      
      // Abrir diálogo elegante con el visor PDF
      this.dialog.open(PdfViewerDialogComponent, {
        width: '95vw',
        maxWidth: '1600px',
        height: '90vh',
        panelClass: 'pdf-viewer-dialog-container',
        hasBackdrop: true,
        disableClose: false,
        autoFocus: false,
        restoreFocus: false,
        data: {
          documentoId: document.documentoID,
          fileName: document.nombre,
          pdfUrl: pdfUrl
        }
      });
      
      // Incrementar contador de vistas
      if (document.documentoID) {
        this.documentoService.incrementViews(document.documentoID).subscribe({
          next: () => {
            if (!environment.production) {
              console.log('✓ Vista registrada correctamente');
            }
            this.loadDocuments();
          },
          error: (error) => {
            if (!environment.production) {
              console.error('✗ Error al registrar vista:', error);
            }
          }
        });
      }
      
      return;
      
      // ===== CÓDIGO ANTIGUO (COMENTADO) =====
      // Los visualizadores completos están disponibles pero no se usan por defecto
      // porque son más lentos. El thumbnail es suficiente para vista previa.
      
      /*
      // Detectar tipos de archivo Office (Excel, Word, PowerPoint)
      const esExcel = document.tipo.toLowerCase().includes('excel') || 
                      document.rutaArchivo?.toLowerCase().endsWith('.xlsx') ||
                      document.rutaArchivo?.toLowerCase().endsWith('.xls');
      
      const esWord = document.tipo.toLowerCase().includes('word') || 
                     document.rutaArchivo?.toLowerCase().endsWith('.docx') ||
                     document.rutaArchivo?.toLowerCase().endsWith('.doc');
      
      const esPowerPoint = document.tipo.toLowerCase().includes('powerpoint') || 
                           document.rutaArchivo?.toLowerCase().endsWith('.pptx') ||
                           document.rutaArchivo?.toLowerCase().endsWith('.ppt');
      
      // Si es un archivo Excel, abrir el visualizador personalizado
      if (esExcel) {
        // Abrir diálogo de visualización de Excel con SheetJS
        this.dialog.open(ExcelViewerDialogComponent, {
          width: '90vw',                           // Ancho del 90% del viewport
          maxWidth: '1400px',                      // Ancho máximo de 1400px
          height: '85vh',                          // Alto del 85% del viewport
          panelClass: 'viewer-dialog',             // Clase CSS personalizada
          hasBackdrop: true,                       // Mostrar backdrop
          disableClose: false,                     // Permitir cerrar con ESC
          autoFocus: false,                        // No hacer autofocus (más rápido)
          restoreFocus: false,                     // No restaurar focus (más rápido)
          data: {
            fileUrl: fileUrl,                      // URL del archivo Excel
            fileName: document.nombre              // Nombre del archivo
          }
        });
        
        // Incrementar contador de vistas
        if (document.documentoID) {
          this.documentoService.incrementViews(document.documentoID).subscribe({
            next: () => {
              if (!environment.production) {
                console.log('✓ Vista registrada correctamente');
              }
              this.loadDocuments();
            },
            error: (error) => {
              if (!environment.production) {
                console.error('✗ Error al registrar vista:', error);
              }
            }
          });
        }
        
        return;
      }
      
      // Si es un archivo Word, abrir el visualizador personalizado
      if (esWord) {
        // Abrir diálogo de visualización de Word con Mammoth.js
        this.dialog.open(WordViewerDialogComponent, {
          width: '90vw',                           // Ancho del 90% del viewport
          maxWidth: '1000px',                      // Ancho máximo de 1000px
          height: '85vh',                          // Alto del 85% del viewport
          panelClass: 'viewer-dialog',             // Clase CSS personalizada
          hasBackdrop: true,                       // Mostrar backdrop
          disableClose: false,                     // Permitir cerrar con ESC
          autoFocus: false,                        // No hacer autofocus (más rápido)
          restoreFocus: false,                     // No restaurar focus (más rápido)
          data: {
            fileUrl: fileUrl,                      // URL del archivo Word
            fileName: document.nombre              // Nombre del archivo
          }
        });
        
        // Incrementar contador de vistas
        if (document.documentoID) {
          this.documentoService.incrementViews(document.documentoID).subscribe({
            next: () => {
              if (!environment.production) {
                console.log('✓ Vista registrada correctamente');
              }
              this.loadDocuments();
            },
            error: (error) => {
              if (!environment.production) {
                console.error('✗ Error al registrar vista:', error);
              }
            }
          });
        }
        
        return;
      }
      
      // Si es PowerPoint, descargar automáticamente
      if (esPowerPoint) {
        // Mostrar mensaje informativo al usuario
        this.showMessage(`📥 Los archivos PowerPoint se descargan automáticamente. Ábrelo con PowerPoint para visualizarlo.`);
        
        // Log para debugging (solo en modo desarrollo)
        if (!environment.production) {
          console.log(`📥 Descargando archivo PowerPoint:`, {
            nombre: document.nombre,
            tipo: document.tipo
          });
        }
        
        // Descargar el archivo automáticamente
        this.downloadDocument(document);
        
        // Salir del método después de iniciar la descarga
        return;
      }
      
      // Detectar si es PDF
      const esPdf = document.tipo.toLowerCase().includes('pdf') || 
                    document.rutaArchivo?.toLowerCase().endsWith('.pdf');
      
      // Si es un archivo PDF, abrir el visualizador personalizado
      if (esPdf) {
        // Abrir diálogo de visualización de PDF
        this.dialog.open(PdfViewerDialogComponent, {
          width: '90vw',                           // Ancho del 90% del viewport
          maxWidth: '1200px',                      // Ancho máximo de 1200px
          height: '85vh',                          // Alto del 85% del viewport
          panelClass: 'viewer-dialog',             // Clase CSS personalizada
          hasBackdrop: true,                       // Mostrar backdrop
          disableClose: false,                     // Permitir cerrar con ESC
          autoFocus: false,                        // No hacer autofocus (más rápido)
          restoreFocus: false,                     // No restaurar focus (más rápido)
          data: {
            fileUrl: fileUrl,                      // URL del archivo PDF
            fileName: document.nombre              // Nombre del archivo
          }
        });
        
        // Incrementar contador de vistas
        if (document.documentoID) {
          this.documentoService.incrementViews(document.documentoID).subscribe({
            next: () => {
              if (!environment.production) {
                console.log('✓ Vista registrada correctamente');
              }
              this.loadDocuments();
            },
            error: (error) => {
              if (!environment.production) {
                console.error('✗ Error al registrar vista:', error);
              }
            }
          });
        }
        
        return;
      }
      
      // Para otros archivos (imágenes, etc.) - Abrir en ventana emergente
      // Configuración de la ventana emergente
      const width = 1000;                          // Ancho de la ventana en píxeles
      const height = 800;                          // Alto de la ventana en píxeles
      const left = (screen.width - width) / 2;     // Calcular posición X para centrar
      const top = (screen.height - height) / 2;    // Calcular posición Y para centrar
      
      // Características de la ventana emergente (formato: propiedad=valor,propiedad=valor)
      const features = `width=${width},height=${height},left=${left},top=${top},` +
                      `toolbar=yes,menubar=no,scrollbars=yes,resizable=yes,location=yes,status=yes`;
      
      // Abrir documento en ventana emergente con nombre 'VisorDocumento'
      const popup = window.open(fileUrl, 'VisorDocumento', features);
      
      // Verificar si el popup se abrió correctamente
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        // El navegador bloqueó la ventana emergente
        if (!environment.production) {
          console.warn('⚠️ El navegador bloqueó la ventana emergente');
        }
        // Mostrar mensaje personalizado al usuario
        this.showMessage('⚠️ Ventana emergente bloqueada. Abriendo en nueva pestaña...');
        // Intentar abrir en nueva pestaña como alternativa
        window.open(fileUrl, '_blank');
        return;
      }
      
      // Mostrar mensaje de confirmación personalizado
      this.showMessage(`👁️ Visualizando: ${document.nombre}`);
      
      // Incrementar contador de vistas en la base de datos
      if (document.documentoID) {
        this.documentoService.incrementViews(document.documentoID).subscribe({
          // Callback cuando se incrementa exitosamente
          next: () => {
            // Log solo en modo desarrollo
            if (!environment.production) {
              console.log('✓ Vista registrada correctamente');
            }
            // Recargar lista para actualizar el contador de vistas
            this.loadDocuments();
          },
          // Callback cuando ocurre un error (no crítico, no mostrar al usuario)
          error: (error) => {
            // Log solo en modo desarrollo
            if (!environment.production) {
              console.error('✗ Error al registrar vista:', error);
            }
          }
        });
      }
      */
      // ===== FIN DEL CÓDIGO ANTIGUO =====
      
    } else {
      // Si no tiene URL, mostrar mensaje de error personalizado
      this.showMessage(`✗ El documento "${document.nombre}" no tiene URL asociada`);
    }
  }

  /**
   * Descargar documento
   * @param doc - Documento a descargar
   */
  downloadDocument(doc: Documento): void {
    // Si el documento tiene URL, iniciar descarga
    if (doc.rutaArchivo) {
      // Validar que la ruta no sea base64
      if (doc.rutaArchivo.includes('base64')) {
        // Log solo en modo desarrollo
        if (!environment.production) {
          console.error('❌ Error: La ruta del archivo contiene base64');
        }
        // Mostrar mensaje personalizado al usuario
        this.showMessage('✗ Error: El documento no tiene una URL válida');
        return;
      }

      // Construir URL completa del archivo usando la configuración del environment
      const backendUrl = environment.apiUrl.replace('/api', '');
      const fileUrl = doc.rutaArchivo.startsWith('http') 
        ? doc.rutaArchivo 
        : `${backendUrl}${doc.rutaArchivo}`;
      
      // Log para debugging (solo en modo desarrollo)
      if (!environment.production) {
        console.log('⬇️ Descargando documento:', {
          nombre: doc.nombre,
          tipo: doc.tipo,
          urlCompleta: fileUrl
        });
      }

      // Validar que la URL es válida
      try {
        new URL(fileUrl);
      } catch (error) {
        // Log solo en modo desarrollo
        if (!environment.production) {
          console.error('❌ URL inválida:', fileUrl);
        }
        // Mostrar mensaje personalizado al usuario
        this.showMessage('✗ Error: URL del documento inválida');
        return;
      }
      
      // Método 1: Intentar descarga directa con fetch
      fetch(fileUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        // Crear URL temporal del blob
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Crear elemento <a> temporal para descargar
        const link = window.document.createElement('a');
        link.href = blobUrl;
        link.download = doc.nombreArchivo || doc.nombre || 'documento';
        
        // Agregar al DOM, hacer clic y remover
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Liberar el objeto URL después de un tiempo
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
        
        // Log solo en modo desarrollo
        if (!environment.production) {
          console.log('✓ Descarga iniciada correctamente');
        }
        // Mostrar mensaje personalizado al usuario
        this.showMessage(`⬇️ Descargando: ${doc.nombre}`);
      })
      .catch(error => {
        // Log solo en modo desarrollo
        if (!environment.production) {
          console.error('✗ Error al descargar:', error);
          console.log('🔄 Intentando método alternativo...');
        }
        
        // Método 2: Fallback - abrir en nueva pestaña
        window.open(fileUrl, '_blank');
        // Mostrar mensaje personalizado al usuario
        this.showMessage(`📂 Abriendo documento: ${doc.nombre}`);
      });
      
      // Incrementar contador de descargas en la base de datos
      if (doc.documentoID) {
        this.documentoService.incrementDownloads(doc.documentoID).subscribe({
          // Callback cuando se incrementa exitosamente
          next: () => {
            // Log solo en modo desarrollo
            if (!environment.production) {
              console.log('✓ Descarga registrada correctamente');
            }
            // Recargar lista para actualizar el contador de descargas
            this.loadDocuments();
          },
          // Callback cuando ocurre un error (no crítico, no mostrar al usuario)
          error: (error) => {
            // Log solo en modo desarrollo
            if (!environment.production) {
              console.error('✗ Error al registrar descarga:', error);
            }
          }
        });
      }
    } else {
      // Si no tiene URL, mostrar mensaje de error personalizado
      this.showMessage(`✗ El documento "${doc.nombre}" no está disponible para descarga`);
    }
  }

  /**
   * Imprimir documento
   * @param doc - Documento a imprimir
   */
  printDocument(doc: Documento): void {
    // Si el documento tiene URL, abrir diálogo de impresión
    if (doc.rutaArchivo) {
      // Construir URL del endpoint de conversión a PDF
      const pdfUrl = `${environment.apiUrl}/documentos/${doc.documentoID}/pdf`;
      
      // Log para debugging
      if (!environment.production) {
        console.log('🖨️ Imprimiendo documento:', {
          nombre: doc.nombre,
          tipo: doc.tipo,
          pdfUrl: pdfUrl
        });
      }
      
      // Mostrar mensaje
      this.showMessage(`🖨️ Preparando impresión: ${doc.nombre}`);
      
      // Descargar el PDF como blob para evitar problemas de CORS
      fetch(pdfUrl)
        .then(response => response.blob())
        .then(blob => {
          // Crear URL del blob (mismo origen)
          const blobUrl = URL.createObjectURL(blob);
          
          // Crear iframe oculto con el blob
          const printIframe = document.createElement('iframe');
          printIframe.style.position = 'fixed';
          printIframe.style.right = '0';
          printIframe.style.bottom = '0';
          printIframe.style.width = '0';
          printIframe.style.height = '0';
          printIframe.style.border = 'none';
          printIframe.style.visibility = 'hidden';
          
          document.body.appendChild(printIframe);
          
          // Asignar el blob URL al iframe
          printIframe.src = blobUrl;
          
          // Esperar a que cargue e imprimir
          printIframe.onload = () => {
            setTimeout(() => {
              try {
                printIframe.contentWindow?.focus();
                printIframe.contentWindow?.print();
                
                // Limpiar después de 30 segundos (dar tiempo suficiente para imprimir)
                setTimeout(() => {
                  if (document.body.contains(printIframe)) {
                    document.body.removeChild(printIframe);
                  }
                  URL.revokeObjectURL(blobUrl);
                }, 30000);
              } catch (error) {
                console.error('Error al imprimir:', error);
                if (document.body.contains(printIframe)) {
                  document.body.removeChild(printIframe);
                }
                URL.revokeObjectURL(blobUrl);
                this.showMessage('✗ Error al imprimir');
              }
            }, 500);
          };
        })
        .catch(error => {
          console.error('Error al descargar PDF para imprimir:', error);
          this.showMessage('✗ Error al preparar el documento para imprimir');
        });
    } else {
      this.showMessage(`✗ El documento "${doc.nombre}" no está disponible para imprimir`);
    }
  }

  /**
   * Editar documento (abrir diálogo de edición)
   * @param document - Documento a editar
   */
  editDocument(document: Documento): void {
    // Abrir diálogo de edición con los datos del documento actual
    const dialogRef = this.dialog.open(CreateDocumentoDialogComponent, {
      width: '600px',                              // Ancho del diálogo
      disableClose: false,                         // Permitir cerrar haciendo clic fuera
      data: document                               // Pasar datos del documento a editar
    });
    
    // Suscribirse al cierre del diálogo para obtener el resultado
    dialogRef.afterClosed().subscribe(result => {
      if (result) {                                // Si el usuario confirmó la edición
        // Preparar datos actualizados del documento
        const datosActualizados: Partial<Documento> = {
          nombre: result.name,                     // Nuevo nombre
          tipo: result.type,                       // Nuevo tipo
          categoria: result.category,              // Nueva categoría
          estado: result.status,                   // Nuevo estado
          descripcion: result.description,         // Nueva descripción
          rutaArchivo: result.url                  // Nueva URL
        };

        // Llamar al servicio para actualizar el documento en el backend
        this.documentoService.update(document.documentoID!, datosActualizados).subscribe({
          // Callback cuando la actualización es exitosa
          next: (documentoActualizado) => {
            // Mostrar mensaje de confirmación personalizado
            this.showMessage(`✓ Documento "${documentoActualizado.nombre}" actualizado correctamente`);
            
            // Recargar la lista completa de documentos desde la base de datos
            this.loadDocuments();
          },
          // Callback cuando ocurre un error
          error: (error) => {
            // Log solo en modo desarrollo
            if (!environment.production) {
              console.error('✗ Error al actualizar documento:', error);
            }
            // Mostrar mensaje personalizado al usuario
            this.showMessage('✗ Error al actualizar el documento. Por favor, intente nuevamente.');
          }
        });
      }
    });
  }

  /**
   * Eliminar documento con confirmación personalizada
   * @param document - Documento a eliminar
   */
  deleteDocument(document: Documento): void {
    // Verificar que el documento tenga ID antes de mostrar el diálogo
    if (!document.documentoID) {
      // Mostrar mensaje de error si el documento no tiene ID
      this.showMessage('Error: Documento sin ID');
      return;
    }

    // Abrir diálogo de confirmación personalizado
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',                              // Ancho del diálogo
      disableClose: false,                         // Permitir cerrar haciendo clic fuera
      data: {
        title: 'Confirmar Eliminación',           // Título del diálogo
        message: `¿Está seguro de que desea eliminar el documento "${document.nombre}"? Esta acción no se puede deshacer.`, // Mensaje de confirmación
        confirmText: 'Eliminar',                   // Texto del botón de confirmar
        cancelText: 'Cancelar',                    // Texto del botón de cancelar
        type: 'danger'                             // Tipo de diálogo (peligro - color rojo)
      }
    });

    // Suscribirse al cierre del diálogo para obtener el resultado
    dialogRef.afterClosed().subscribe(confirmed => {
      // Si el usuario confirmó la eliminación (clicked en "Eliminar")
      if (confirmed) {
        // Llamar al servicio para eliminar el documento del backend
        this.documentoService.delete(document.documentoID!).subscribe({
          // Callback cuando la eliminación es exitosa
          next: () => {
            // Mostrar mensaje de confirmación con ícono de éxito
            this.showMessage(`✓ Documento "${document.nombre}" eliminado correctamente`);
            
            // Recargar la lista completa de documentos desde la base de datos
            this.loadDocuments();
          },
          // Callback cuando ocurre un error
          error: (error) => {
            // Registrar el error en la consola para debugging
            console.error('Error al eliminar documento:', error);
            // Mostrar mensaje de error al usuario
            this.showMessage('✗ Error al eliminar el documento');
          }
        });
      }
      // Si el usuario canceló (clicked en "Cancelar" o cerró el diálogo)
      // No hacer nada, simplemente cerrar el diálogo
    });
  }

  // ===== MÉTODOS DE UTILIDAD =====
  
  // Obtener icono de Material según tipo de documento
  getTypeIcon(type: string): string {
    // Mapeo de tipos a iconos de Material
    const icons: { [key: string]: string } = {
      'PDF': 'picture_as_pdf',                     // Icono para PDF
      'Word': 'description',                       // Icono para Word
      'Excel': 'table_chart',                      // Icono para Excel
      'Image': 'image',                            // Icono para imágenes
      'Video': 'videocam'                          // Icono para videos
    };
    // Retornar icono correspondiente o icono genérico
    return icons[type] || 'insert_drive_file';
  }

  // Obtener icono de Material según estado del documento
  getStatusIcon(status: string): string {
    // Mapeo de estados a iconos de Material
    const icons: { [key: string]: string } = {
      'active': 'check_circle',                    // Icono para activo
      'draft': 'edit',                             // Icono para borrador
      'archived': 'archive'                        // Icono para archivado
    };
    // Retornar icono correspondiente o icono de ayuda
    return icons[status] || 'help';
  }

  // Obtener etiqueta legible de la categoría
  getCategoryLabel(category: string): string {
    // Buscar la categoría en el array de categorías
    const cat = this.categories.find(c => c.value === category);
    // Retornar la etiqueta o la categoría original si no se encuentra
    return cat ? cat.label : category;
  }

  // Obtener tipo de archivo desde el nombre del archivo
  private getFileType(filename: string): string {
    // Extraer extensión del archivo
    const extension = filename.split('.').pop()?.toLowerCase();
    // Mapeo de extensiones a tipos
    const types: { [key: string]: string } = {
      'pdf': 'PDF',                                // Archivos PDF
      'doc': 'Word',                               // Archivos Word antiguos
      'docx': 'Word',                              // Archivos Word nuevos
      'xls': 'Excel',                              // Archivos Excel antiguos
      'xlsx': 'Excel',                             // Archivos Excel nuevos
      'png': 'Image',                              // Imágenes PNG
      'jpg': 'Image',                              // Imágenes JPG
      'jpeg': 'Image'                              // Imágenes JPEG
    };
    // Retornar tipo correspondiente o 'Archivo' genérico
    return types[extension || ''] || 'Archivo';
  }

  // Formatear tamaño de archivo en bytes a formato legible
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';             // Caso especial para 0 bytes
    const k = 1024;                                // Constante para conversión (1 KB = 1024 bytes)
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];     // Unidades de medida
    // Calcular índice de la unidad apropiada
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    // Calcular y formatear el tamaño con 2 decimales
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  // ===== MÉTODO AUXILIAR =====
  
  // Mostrar mensaje de notificación usando MatSnackBar
  private showMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {        // Abrir snackbar con mensaje y botón
      duration: 3000,                              // Duración de 3 segundos
      horizontalPosition: 'end',                   // Posición horizontal a la derecha
      verticalPosition: 'top'                      // Posición vertical arriba
    });
  }
}
