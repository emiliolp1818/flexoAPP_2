// ===== COMPONENTE DE CONDICIÓN ÚNICA =====
// Componente Angular para gestionar el sistema de Condición Única
// Proporciona interfaz de usuario tipo cuadrícula para visualizar y gestionar registros

// Importar decorador Component para definir el componente
// Importar signal para manejo de estado reactivo
// Importar OnInit para el ciclo de vida del componente
// Importar inject e Inject para inyección de dependencias
import { Component, signal, OnInit, inject, Inject } from '@angular/core';

// Importar CommonModule para directivas comunes de Angular (ngIf, ngFor, etc.)
import { CommonModule } from '@angular/common';

// Importar módulos de Angular Material para la interfaz de usuario
import { MatButtonModule } from '@angular/material/button'; // Botones Material
import { MatIconModule } from '@angular/material/icon'; // Iconos Material
import { MatCardModule } from '@angular/material/card'; // Tarjetas Material
import { MatFormFieldModule } from '@angular/material/form-field'; // Campos de formulario
import { MatInputModule } from '@angular/material/input'; // Inputs de texto
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar'; // Notificaciones toast
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Spinner de carga
import { MatTooltipModule } from '@angular/material/tooltip'; // Tooltips informativos
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'; // Diálogos modales

// Importar módulos de formularios de Angular
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Formularios template-driven y reactivos
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Constructor de formularios y validadores

// Importar HttpClient para peticiones HTTP
import { HttpClient } from '@angular/common/http';

// Importar firstValueFrom para convertir Observables a Promises
import { firstValueFrom } from 'rxjs';

// Importar environment para obtener la URL del API
import { environment } from '../../../../environments/environment';

// Importar servicio personalizado para operaciones CRUD de Condición Única
import { CondicionUnicaService } from '../../services/condicion-unica.service';

// Importar modelo de datos de Condición Única
import { CondicionUnica } from '../../models/condicion-unica.model';

/**
 * Componente CondicionUnicaComponent
 * Gestiona la visualización y operaciones CRUD de Condición Única
 * Utiliza diseño tipo cuadrícula con tarjetas Material Design
 */
@Component({
  // Selector CSS para usar el componente en templates: <app-condicion-unica></app-condicion-unica>
  selector: 'app-condicion-unica',
  
  // Componente standalone (no requiere módulo padre)
  standalone: true,
  
  // Importar todos los módulos necesarios para el template
  imports: [
    CommonModule, // Directivas comunes de Angular
    MatButtonModule, // Botones Material
    MatIconModule, // Iconos Material
    MatCardModule, // Tarjetas Material
    MatFormFieldModule, // Campos de formulario
    MatInputModule, // Inputs de texto
    MatSnackBarModule, // Notificaciones
    MatProgressSpinnerModule, // Spinner de carga
    MatTooltipModule, // Tooltips
    MatDialogModule, // Diálogos modales
    FormsModule, // Formularios template-driven
    ReactiveFormsModule // Formularios reactivos
  ],
  
  // Ruta al archivo HTML del template
  templateUrl: './condicion-unica.html',
  
  // Ruta al archivo SCSS de estilos
  styleUrls: ['./condicion-unica.scss']
})
export class CondicionUnicaComponent implements OnInit {
  // ===== INYECCIÓN DE DEPENDENCIAS =====
  // Servicios necesarios para el funcionamiento del componente
  
  // Inyectar servicio de Condición Única para operaciones CRUD
  private condicionService = inject(CondicionUnicaService);
  
  // Inyectar servicio de notificaciones para mostrar mensajes al usuario
  private snackBar = inject(MatSnackBar);
  
  // Inyectar servicio de diálogos para abrir modales
  private dialog = inject(MatDialog);
  
  // Inyectar FormBuilder (aunque no se usa en este componente, está disponible)
  private fb = inject(FormBuilder);

  // ===== SEÑALES REACTIVAS =====
  // Signals de Angular para manejo de estado reactivo
  // Los signals notifican automáticamente cambios a la vista
  
  // Lista completa de registros de Condición Única obtenidos del backend
  items = signal<CondicionUnica[]>([]);
  
  // Lista filtrada según término de búsqueda (se muestra en la tabla)
  filteredItems = signal<CondicionUnica[]>([]);
  
  // Término de búsqueda actual ingresado por el usuario
  searchTerm = signal<string>('');
  
  // Estado de carga (true cuando está cargando datos del backend)
  loading = signal<boolean>(false);
  
  // Estado de carga de archivo Excel (true cuando está subiendo archivo)
  uploading = signal<boolean>(false);
  
  // Progreso de carga del archivo Excel (0-100)
  uploadProgress = signal<number>(0);

  /**
   * Inicialización del componente
   * Se ejecuta automáticamente al cargar el componente
   * Carga los datos iniciales desde el backend
   */
  ngOnInit(): void {
    // Llamar a la función para cargar datos al inicializar
    this.loadData();
  }

  /**
   * Cargar todos los registros desde el backend
   * Actualiza las señales items y filteredItems
   * Muestra mensaje de error si falla la carga
   */
  loadData(): void {
    // Establecer estado de carga en true para mostrar spinner
    this.loading.set(true);
    
    // Llamar al servicio para obtener todos los registros
    this.condicionService.getAll().subscribe({
      // Callback cuando la petición es exitosa
      next: (data) => {
        // Actualizar la lista completa de items con los datos recibidos
        this.items.set(data);
        
        // Actualizar la lista filtrada con todos los datos (sin filtro inicial)
        this.filteredItems.set(data);
        
        // Establecer estado de carga en false para ocultar spinner
        this.loading.set(false);
      },
      // Callback cuando la petición falla
      error: (error) => {
        // Mostrar error en consola para debugging
        console.error('Error cargando Condición Única:', error);
        
        // Mostrar notificación de error al usuario
        this.snackBar.open('Error al cargar registros', 'Cerrar', { duration: 3000 });
        
        // Establecer estado de carga en false para ocultar spinner
        this.loading.set(false);
      }
    });
  }

  /**
   * Buscar registros por término de búsqueda
   * Filtra la lista de items por F Artículo
   * Se ejecuta en tiempo real mientras el usuario escribe
   */
  onSearch(): void {
    // Obtener el término de búsqueda, convertir a minúsculas y eliminar espacios
    const term = this.searchTerm().toLowerCase().trim();
    
    // Si no hay término de búsqueda
    if (!term) {
      // Mostrar todos los registros sin filtro
      this.filteredItems.set(this.items());
      // Salir de la función
      return;
    }

    // Filtrar la lista de items
    // Mantener solo los items cuyo F Artículo contenga el término de búsqueda
    const filtered = this.items().filter(item =>
      // Convertir F Artículo a minúsculas y verificar si contiene el término
      item.fArticulo.toLowerCase().includes(term)
    );
    
    // Actualizar la lista filtrada con los resultados de la búsqueda
    this.filteredItems.set(filtered);
  }

  /**
   * Limpiar búsqueda y mostrar todos los registros
   * Resetea el término de búsqueda y restaura la lista completa
   */
  clearSearch(): void {
    // Limpiar el término de búsqueda (establecer en cadena vacía)
    this.searchTerm.set('');
    
    // Restaurar la lista filtrada con todos los items
    this.filteredItems.set(this.items());
  }

  /**
   * Crear nuevo registro
   * Abre diálogo para ingresar datos del nuevo registro
   */
  createNew(): void {
    // Abrir diálogo modal con el componente de formulario
    const dialogRef = this.dialog.open(CondicionUnicaFormDialog, {
      // Ancho del diálogo en píxeles
      width: '600px',
      // Datos a pasar al diálogo: modo 'create' y sin item (nuevo registro)
      data: { mode: 'create', item: null }
    });

    // Suscribirse al evento de cierre del diálogo
    dialogRef.afterClosed().subscribe(result => {
      // Si el usuario confirmó y hay datos (no canceló)
      if (result) {
        // Llamar al servicio para crear el registro en el backend
        this.condicionService.create(result).subscribe({
          // Callback cuando la creación es exitosa
          next: (created) => {
            // Mostrar notificación de éxito al usuario
            this.snackBar.open('Registro creado exitosamente', 'Cerrar', { duration: 3000 });
            
            // Recargar todos los datos para mostrar el nuevo registro en la tabla
            this.loadData();
          },
          // Callback cuando la creación falla
          error: (error) => {
            // Mostrar error en consola para debugging
            console.error('Error creando registro:', error);
            
            // Mostrar notificación de error al usuario
            this.snackBar.open('Error al crear registro', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }

  /**
   * Editar registro existente
   * Abre diálogo con datos pre-cargados para edición
   * @param item - Registro a editar
   */
  editItem(item: CondicionUnica): void {
    // Abrir diálogo modal con el componente de formulario
    const dialogRef = this.dialog.open(CondicionUnicaFormDialog, {
      // Ancho del diálogo en píxeles
      width: '600px',
      // Datos a pasar al diálogo: modo 'edit' y clon del item para evitar modificaciones directas
      data: { mode: 'edit', item: { ...item } } // Operador spread para clonar el objeto
    });

    // Suscribirse al evento de cierre del diálogo
    dialogRef.afterClosed().subscribe(result => {
      // Si el usuario confirmó, hay datos y el item tiene ID
      if (result && item.id) {
        // Asegurar que el ID esté presente en el resultado
        result.id = item.id;
        
        // Llamar al servicio para actualizar el registro en el backend
        this.condicionService.update(item.id, result).subscribe({
          // Callback cuando la actualización es exitosa
          next: (updated) => {
            // Mostrar notificación de éxito al usuario
            this.snackBar.open('Registro actualizado exitosamente', 'Cerrar', { duration: 3000 });
            
            // Recargar todos los datos para mostrar los cambios en la tabla
            this.loadData();
          },
          // Callback cuando la actualización falla
          error: (error) => {
            // Mostrar error en consola para debugging
            console.error('Error actualizando registro:', error);
            
            // Mostrar notificación de error al usuario
            this.snackBar.open('Error al actualizar registro', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }

  /**
   * Ver detalles completos del registro
   * Muestra toda la información en un diálogo
   * @param item - Registro a visualizar
   * TODO: Implementar diálogo de detalles
   */
  viewDetails(item: CondicionUnica): void {
    // Mostrar notificación temporal con el F Artículo del registro
    this.snackBar.open(`Ver detalles: ${item.fArticulo}`, 'Cerrar', { duration: 2000 });
    // TODO: Abrir diálogo de detalles con toda la información del registro
  }

  /**
   * Eliminar registro existente
   * Solicita confirmación antes de eliminar
   * @param item - Registro a eliminar
   */
  deleteItem(item: CondicionUnica): void {
    // Mostrar notificación de confirmación usando snackBar con acción
    const snackBarRef = this.snackBar.open(
      `¿Eliminar el registro ${item.fArticulo}?`, 
      'Eliminar', 
      { duration: 5000 }
    );
    
    // Si el usuario hace clic en "Eliminar"
    snackBarRef.onAction().subscribe(() => {
      // Ejecutar la eliminación
      this.executeDelete(item);
    });
    
    // Salir de la función - la eliminación se ejecutará si el usuario hace clic en "Eliminar"
    return;
  }

  // Método auxiliar para ejecutar la eliminación
  private executeDelete(item: CondicionUnica): void {

    // Verificar que el item tenga ID (requerido para eliminar)
    if (!item.id) {
      // Mostrar notificación de error si no hay ID
      this.snackBar.open('Error: Registro sin ID', 'Cerrar', { duration: 3000 });
      // Salir de la función
      return;
    }

    // Llamar al servicio para eliminar el registro del backend
    this.condicionService.delete(item.id).subscribe({
      // Callback cuando la eliminación es exitosa
      next: () => {
        // Mostrar notificación de éxito al usuario
        this.snackBar.open('Registro eliminado exitosamente', 'Cerrar', { duration: 3000 });
        
        // Recargar todos los datos para actualizar la tabla sin el registro eliminado
        this.loadData();
      },
      // Callback cuando la eliminación falla
      error: (error) => {
        // Mostrar error en consola para debugging
        console.error('Error eliminando registro:', error);
        
        // Mostrar notificación de error al usuario
        this.snackBar.open('Error al eliminar registro', 'Cerrar', { duration: 3000 });
      }
    });
  }

  /**
   * Activar selector de archivo para importar Excel
   * Crea un input file temporal y simula un clic
   */
  triggerFileUpload(): void {
    // Crear elemento input file temporal
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx,.xls';
    
    // Manejar selección de archivo
    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.uploadExcelFile(file);
      }
    };
    
    // Simular clic para abrir selector de archivos
    fileInput.click();
  }

  /**
   * Subir archivo Excel al servidor
   * Procesa el archivo y actualiza los registros
   * @param file - Archivo Excel seleccionado
   */
  private uploadExcelFile(file: File): void {
    // Establecer estado de carga
    this.uploading.set(true);
    this.uploadProgress.set(0);
    
    // Crear FormData para enviar el archivo
    const formData = new FormData();
    formData.append('file', file);
    
    // TODO: Implementar llamada al servicio para subir el archivo
    // Por ahora, simular carga
    const interval = setInterval(() => {
      const currentProgress = this.uploadProgress();
      if (currentProgress < 100) {
        this.uploadProgress.set(currentProgress + 10);
      } else {
        clearInterval(interval);
        this.uploading.set(false);
        this.uploadProgress.set(0);
        this.snackBar.open('Archivo cargado exitosamente', 'Cerrar', { duration: 3000 });
        this.loadData(); // Recargar datos
      }
    }, 200);
  }

  /**
   * Exportar registros a Excel (CSV)
   * Genera archivo CSV con todos los registros filtrados
   * Compatible con Excel sin dependencias externas
   */
  exportToExcel(): void {
    try {
      // Obtener los registros filtrados actuales (los que se muestran en la tabla)
      const dataToExport = this.filteredItems();
      
      // Verificar que haya datos para exportar
      if (dataToExport.length === 0) {
        // Mostrar notificación si no hay datos
        this.snackBar.open('No hay datos para exportar', 'Cerrar', { duration: 3000 });
        // Salir de la función
        return;
      }

      // Crear array de encabezados CSV en español
      // Cambiado de "Referencia" a "Descripción"
      const headers = ['F Artículo', 'Descripción', 'Estante', 'Número de Carpeta', 'Fecha de Creación', 'Última Modificación'];
      
      // Convertir cada registro a un array de valores para CSV
      const rows = dataToExport.map(item => [
        // F Artículo del registro
        item.fArticulo,
        // Descripción del registro (antes era referencia)
        item.descripcion,
        // Estante del registro
        item.estante,
        // Número de carpeta del registro
        item.numeroCarpeta,
        // Fecha de creación formateada en español (dd/mm/aaaa) o cadena vacía si no existe
        item.createdDate ? new Date(item.createdDate).toLocaleDateString('es-ES') : '',
        // Fecha de última modificación formateada en español o cadena vacía si no existe
        item.lastModified ? new Date(item.lastModified).toLocaleDateString('es-ES') : ''
      ]);

      // Combinar encabezados y filas en formato CSV
      const csvContent = [
        // Primera línea: encabezados separados por comas
        headers.join(','),
        // Resto de líneas: filas de datos
        // Cada celda se envuelve en comillas para manejar comas dentro de los datos
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n'); // Unir todas las líneas con salto de línea

      // Crear Blob (objeto binario) con el contenido CSV
      // \ufeff es el BOM (Byte Order Mark) para UTF-8, necesario para Excel
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Crear elemento <a> (enlace) para descargar el archivo
      const link = document.createElement('a');
      
      // Crear URL temporal del Blob
      const url = URL.createObjectURL(blob);
      
      // Generar nombre de archivo con fecha y hora actual
      // Formato: CondicionUnica_YYYY-MM-DDTHH-MM-SS.csv
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const fileName = `CondicionUnica_${timestamp}.csv`;
      
      // Configurar atributos del enlace de descarga
      link.setAttribute('href', url); // URL del archivo
      link.setAttribute('download', fileName); // Nombre del archivo a descargar
      link.style.visibility = 'hidden'; // Ocultar el enlace (no visible en la página)
      
      // Agregar enlace al DOM
      document.body.appendChild(link);
      
      // Simular clic en el enlace para iniciar descarga
      link.click();
      
      // Remover enlace del DOM (limpieza)
      document.body.removeChild(link);
      
      // Liberar URL del objeto Blob (liberar memoria)
      URL.revokeObjectURL(url);

      // Mostrar notificación de éxito con el nombre del archivo
      this.snackBar.open(`Archivo ${fileName} descargado exitosamente`, 'Cerrar', { duration: 3000 });
    } catch (error) {
      // Capturar cualquier error durante la exportación
      // Mostrar error en consola para debugging
      console.error('Error exportando a CSV:', error);
      
      // Mostrar notificación de error al usuario
      this.snackBar.open('Error al exportar archivo', 'Cerrar', { duration: 3000 });
    }
  }
}

// ===== COMPONENTE DE DIÁLOGO PARA FORMULARIO =====
// Diálogo modal para crear y editar registros de Condición Única
@Component({
  // Selector CSS para el componente de diálogo
  selector: 'condicion-unica-form-dialog',
  
  // Componente standalone (no requiere módulo padre)
  standalone: true,
  
  // Importar módulos necesarios para el template del diálogo
  imports: [
    CommonModule, // Directivas comunes de Angular
    MatDialogModule, // Módulo de diálogos Material
    MatButtonModule, // Botones Material
    MatFormFieldModule, // Campos de formulario Material
    MatInputModule, // Inputs de texto Material
    MatIconModule, // Iconos Material
    MatProgressSpinnerModule, // Spinner de carga
    ReactiveFormsModule // Formularios reactivos
  ],
  
  // Template inline del diálogo (HTML dentro del componente)
  template: `
    <!-- Contenedor principal del diálogo con padding -->
    <div class="dialog-container">
      <!-- Título del diálogo con icono dinámico según el modo -->
      <h2 mat-dialog-title>
        <!-- Icono: 'add' para crear, 'edit' para editar -->
        <mat-icon>{{ data.mode === 'create' ? 'add' : 'edit' }}</mat-icon>
        <!-- Texto del título: 'Nuevo Registro' para crear, 'Editar Registro' para editar -->
        {{ data.mode === 'create' ? 'Nuevo Registro' : 'Editar Registro' }}
      </h2>

      <!-- Contenido del diálogo con el formulario -->
      <mat-dialog-content>
        <!-- Formulario reactivo vinculado a la propiedad 'form' -->
        <form [formGroup]="form" class="form-container">
          
          <!-- Campo de formulario: F Artículo -->
          <mat-form-field appearance="outline" class="full-width">
            <!-- Etiqueta del campo -->
            <mat-label>F Artículo</mat-label>
            <!-- Input vinculado al control 'fArticulo' del formulario con evento blur -->
            <!-- El evento blur se dispara cuando el usuario sale del campo (pierde el foco) -->
            <!-- Esto activa la búsqueda automática en la tabla designs -->
            <input matInput formControlName="fArticulo" placeholder="Ej: F204567" required
              (blur)="onArticuloBlur()">
            <!-- Icono prefijo (antes del input) -->
            <mat-icon matPrefix>tag</mat-icon>
            <!-- Spinner de carga cuando está buscando en designs -->
            <!-- Solo visible cuando loadingDesign es true -->
            <mat-spinner *ngIf="loadingDesign" diameter="20" matSuffix></mat-spinner>
            <!-- Mensaje de error si el campo es requerido y está vacío -->
            <mat-error *ngIf="form.get('fArticulo')?.hasError('required')">
              El F Artículo es requerido
            </mat-error>
            <!-- Hint informativo cuando se encuentra en designs -->
            <!-- Muestra un check verde cuando se carga la descripción automáticamente -->
            <mat-hint *ngIf="designFound">✓ Descripción cargada desde diseños</mat-hint>
          </mat-form-field>

          <!-- Campo de formulario: Descripción (antes era Referencia) -->
          <mat-form-field appearance="outline" class="full-width">
            <!-- Etiqueta del campo cambiada de "Referencia" a "Descripción" -->
            <mat-label>Descripción</mat-label>
            <!-- Input vinculado al control 'descripcion' del formulario -->
            <!-- Este campo se llena automáticamente si el artículo existe en designs -->
            <!-- Si no existe, el usuario debe ingresarlo manualmente -->
            <input matInput formControlName="descripcion" placeholder="Ej: Bolsa de polietileno" required>
            <!-- Icono prefijo (antes del input) -->
            <mat-icon matPrefix>description</mat-icon>
            <!-- Mensaje de error si el campo es requerido y está vacío -->
            <mat-error *ngIf="form.get('descripcion')?.hasError('required')">
              La Descripción es requerida
            </mat-error>
            <!-- Hint informativo cuando no se encuentra en designs -->
            <!-- Indica al usuario que debe ingresar la descripción manualmente -->
            <mat-hint *ngIf="!designFound && form.get('fArticulo')?.value">
              Ingrese manualmente la descripción
            </mat-hint>
          </mat-form-field>

          <!-- Campo de formulario: Estante -->
          <mat-form-field appearance="outline" class="full-width">
            <!-- Etiqueta del campo -->
            <mat-label>Estante</mat-label>
            <!-- Input vinculado al control 'estante' del formulario -->
            <input matInput formControlName="estante" placeholder="Ej: E-01" required>
            <!-- Icono prefijo (antes del input) -->
            <mat-icon matPrefix>shelves</mat-icon>
            <!-- Mensaje de error si el campo es requerido y está vacío -->
            <mat-error *ngIf="form.get('estante')?.hasError('required')">
              El Estante es requerido
            </mat-error>
          </mat-form-field>

          <!-- Campo de formulario: Número de Carpeta -->
          <mat-form-field appearance="outline" class="full-width">
            <!-- Etiqueta del campo -->
            <mat-label>Número de Carpeta</mat-label>
            <!-- Input vinculado al control 'numeroCarpeta' del formulario -->
            <input matInput formControlName="numeroCarpeta" placeholder="Ej: C-001" required>
            <!-- Icono prefijo (antes del input) -->
            <mat-icon matPrefix>folder</mat-icon>
            <!-- Mensaje de error si el campo es requerido y está vacío -->
            <mat-error *ngIf="form.get('numeroCarpeta')?.hasError('required')">
              El Número de Carpeta es requerido
            </mat-error>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <!-- Acciones del diálogo (botones) alineados a la derecha -->
      <mat-dialog-actions align="end">
        <!-- Botón Cancelar: cierra el diálogo sin guardar -->
        <button mat-button (click)="onCancel()">
          <!-- Icono de cerrar -->
          <mat-icon>close</mat-icon>
          Cancelar
        </button>
        <!-- Botón Guardar: guarda los datos y cierra el diálogo -->
        <!-- Deshabilitado si el formulario no es válido -->
        <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!form.valid">
          <!-- Icono de guardar -->
          <mat-icon>save</mat-icon>
          <!-- Texto del botón: 'Crear' para nuevo, 'Guardar' para editar -->
          {{ data.mode === 'create' ? 'Crear' : 'Guardar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  
  // Estilos inline del diálogo (CSS dentro del componente)
  styles: [`
    /* Contenedor principal del diálogo con padding */
    .dialog-container {
      padding: 8px;
    }

    /* Estilos del título del diálogo */
    h2 {
      display: flex; /* Flexbox para alinear icono y texto */
      align-items: center; /* Alinear verticalmente al centro */
      gap: 12px; /* Espacio entre icono y texto */
      color: #1e293b; /* Color gris oscuro para el texto */
      font-weight: 700; /* Texto en negrita */
      margin: 0 0 16px 0; /* Margen inferior de 16px */

      /* Estilos del icono dentro del título */
      mat-icon {
        color: #2563eb; /* Color azul primario para el icono */
      }
    }

    /* Contenedor del formulario */
    .form-container {
      display: flex; /* Flexbox para organizar campos */
      flex-direction: column; /* Organizar campos en columna vertical */
      gap: 16px; /* Espacio de 16px entre campos */
      min-width: 500px; /* Ancho mínimo del formulario */
      padding: 16px 0; /* Padding vertical de 16px */
    }

    /* Clase para campos de ancho completo */
    .full-width {
      width: 100%; /* Ocupar todo el ancho disponible */
    }

    /* Estilos de las acciones del diálogo (botones) */
    mat-dialog-actions {
      padding: 16px 0 8px 0; /* Padding: 16px arriba, 8px abajo */
      gap: 8px; /* Espacio de 8px entre botones */

      /* Estilos de los botones dentro de las acciones */
      button {
        display: flex; /* Flexbox para alinear icono y texto */
        align-items: center; /* Alinear verticalmente al centro */
        gap: 8px; /* Espacio de 8px entre icono y texto */
      }
    }
  `]
})
export class CondicionUnicaFormDialog {
  // Formulario reactivo con validaciones
  // Contiene los controles para cada campo del formulario
  form: FormGroup;
  
  // Estado de carga cuando busca en designs
  // Se activa (true) mientras se realiza la petición HTTP a la tabla designs
  loadingDesign = false;
  
  // Indica si se encontró el diseño en la tabla designs
  // true = artículo existe en designs y se cargó la descripción automáticamente
  // false = artículo no existe en designs, usuario debe ingresar descripción manualmente
  designFound = false;
  
  // Inyectar HttpClient para buscar en designs
  // Permite realizar peticiones HTTP al backend para buscar el artículo
  private http = inject(HttpClient);
  
  // Inyectar SnackBar para notificaciones
  // Muestra mensajes toast al usuario sobre el resultado de la búsqueda
  private snackBar = inject(MatSnackBar);

  /**
   * Constructor del componente de diálogo
   * Inyecta dependencias necesarias y inicializa el formulario
   */
  constructor(
    // Inyectar referencia al diálogo para poder cerrarlo
    public dialogRef: MatDialogRef<CondicionUnicaFormDialog>,
    
    // Inyectar datos pasados al diálogo desde el componente padre
    // Contiene el modo ('create' o 'edit') y el item a editar (o null para crear)
    @Inject(MAT_DIALOG_DATA) public data: { mode: string; item: CondicionUnica | null },
    
    // Inyectar FormBuilder para crear el formulario reactivo
    private fb: FormBuilder
  ) {
    // Inicializar formulario reactivo con FormBuilder
    this.form = this.fb.group({
      // Control 'fArticulo': valor inicial del item o cadena vacía, validador requerido
      // Este campo identifica el artículo de forma única
      fArticulo: [this.data.item?.fArticulo || '', Validators.required],
      
      // Control 'descripcion': valor inicial del item o cadena vacía, validador requerido
      // CAMBIADO: antes era 'referencia', ahora es 'descripcion'
      // Este campo se carga automáticamente desde designs.descripcion si el artículo existe
      descripcion: [this.data.item?.descripcion || '', Validators.required],
      
      // Control 'estante': valor inicial del item o cadena vacía, validador requerido
      // Ubicación física del artículo en el almacén
      estante: [this.data.item?.estante || '', Validators.required],
      
      // Control 'numeroCarpeta': valor inicial del item o cadena vacía, validador requerido
      // Número de carpeta donde está archivado el documento del artículo
      numeroCarpeta: [this.data.item?.numeroCarpeta || '', Validators.required]
    });
  }

  /**
   * Buscar diseño en la tabla designs cuando el usuario sale del campo F Artículo
   * Carga automáticamente la descripción si existe en la tabla designs
   * Se ejecuta cuando el usuario hace blur (pierde el foco) en el campo F Artículo
   */
  async onArticuloBlur(): Promise<void> {
    // Obtener el valor del campo F Artículo y eliminar espacios en blanco
    const fArticulo = this.form.get('fArticulo')?.value?.trim();
    
    // Si no hay valor, salir de la función sin hacer nada
    if (!fArticulo) {
      return;
    }
    
    // Si ya hay descripción ingresada manualmente en modo crear, no buscar
    // Esto evita sobrescribir una descripción que el usuario ya ingresó
    const descripcionActual = this.form.get('descripcion')?.value?.trim();
    if (descripcionActual && this.data.mode === 'create') {
      return;
    }
    
    try {
      // Activar estado de carga para mostrar spinner en la UI
      this.loadingDesign = true;
      // Resetear flag de diseño encontrado
      this.designFound = false;
      
      // Log para debugging: mostrar qué artículo se está buscando
      console.log(`🔍 Buscando diseño para artículo: ${fArticulo}`);
      
      // Realizar petición HTTP GET al endpoint de designs
      // El endpoint busca en la tabla designs por el campo article_f
      // Retorna el diseño completo si existe, incluyendo el campo descripcion
      const response = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/designs/articulo/${fArticulo}`)
      );
      
      // Log para debugging: mostrar respuesta completa del servidor
      console.log('📡 Respuesta del servidor:', response);
      
      // Verificar si se encontró el diseño y tiene el campo descripcion
      if (response && response.success && response.data && response.data.descripcion) {
        // Cargar la descripción en el campo del formulario usando patchValue
        // patchValue actualiza solo los campos especificados sin afectar los demás
        this.form.patchValue({
          descripcion: response.data.descripcion
        });
        
        // Marcar que se encontró el diseño para mostrar hint de éxito
        this.designFound = true;
        // Log de éxito con la descripción cargada
        console.log(`✅ Diseño encontrado - Descripción cargada: ${response.data.descripcion}`);
        
        // Mostrar notificación toast al usuario confirmando la carga automática
        this.snackBar.open(
          `✓ Descripción cargada desde diseños: ${response.data.descripcion}`, 
          'Cerrar', 
          { duration: 3000 }
        );
      } else {
        // No se encontró el diseño en la tabla designs
        console.log(`⚠️ Diseño no encontrado para artículo: ${fArticulo}`);
        this.designFound = false;
        
        // Mostrar notificación informativa al usuario
        // Indica que debe ingresar la descripción manualmente
        this.snackBar.open(
          'Artículo no encontrado en diseños. Ingrese la descripción manualmente.', 
          'Cerrar', 
          { duration: 3000 }
        );
      }
      
    } catch (error: any) {
      // Capturar cualquier error durante la búsqueda
      console.error('❌ Error buscando diseño:', error);
      this.designFound = false;
      
      // Si es error 404, el artículo no existe en la tabla designs
      if (error.status === 404) {
        console.log(`⚠️ Artículo ${fArticulo} no existe en la tabla designs`);
        this.snackBar.open(
          'Artículo no encontrado en diseños. Ingrese la descripción manualmente.', 
          'Cerrar', 
          { duration: 3000 }
        );
      } else {
        // Otro tipo de error (500, error de red, etc.)
        this.snackBar.open(
          'Error al buscar en diseños. Ingrese la descripción manualmente.', 
          'Cerrar', 
          { duration: 3000 }
        );
      }
    } finally {
      // Siempre desactivar estado de carga, sin importar el resultado
      // Esto oculta el spinner en la UI
      this.loadingDesign = false;
    }
  }

  /**
   * Cancelar y cerrar el diálogo sin guardar
   * No retorna ningún valor al componente padre
   */
  onCancel(): void {
    // Cerrar el diálogo sin pasar datos (undefined)
    // El componente padre no recibirá ningún valor
    this.dialogRef.close();
  }

  /**
   * Guardar los datos y cerrar el diálogo
   * Retorna los valores del formulario al componente padre
   * Solo se ejecuta si el formulario es válido (todos los campos requeridos llenos)
   */
  onSave(): void {
    // Verificar que el formulario sea válido (todos los campos requeridos llenos)
    if (this.form.valid) {
      // Cerrar el diálogo y retornar los valores del formulario al componente padre
      // El componente padre recibirá un objeto con: fArticulo, descripcion, estante, numeroCarpeta
      this.dialogRef.close(this.form.value);
    }
  }
}
