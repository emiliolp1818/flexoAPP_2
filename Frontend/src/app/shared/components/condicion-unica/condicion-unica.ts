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
      const headers = ['F Artículo', 'Referencia', 'Estante', 'Número de Carpeta', 'Fecha de Creación', 'Última Modificación'];
      
      // Convertir cada registro a un array de valores para CSV
      const rows = dataToExport.map(item => [
        // F Artículo del registro
        item.fArticulo,
        // Referencia del registro
        item.referencia,
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
            <!-- Input vinculado al control 'fArticulo' del formulario -->
            <input matInput formControlName="fArticulo" placeholder="Ej: F204567" required>
            <!-- Icono prefijo (antes del input) -->
            <mat-icon matPrefix>tag</mat-icon>
            <!-- Mensaje de error si el campo es requerido y está vacío -->
            <mat-error *ngIf="form.get('fArticulo')?.hasError('required')">
              El F Artículo es requerido
            </mat-error>
          </mat-form-field>

          <!-- Campo de formulario: Referencia -->
          <mat-form-field appearance="outline" class="full-width">
            <!-- Etiqueta del campo -->
            <mat-label>Referencia</mat-label>
            <!-- Input vinculado al control 'referencia' del formulario -->
            <input matInput formControlName="referencia" placeholder="Ej: REF-001" required>
            <!-- Icono prefijo (antes del input) -->
            <mat-icon matPrefix>description</mat-icon>
            <!-- Mensaje de error si el campo es requerido y está vacío -->
            <mat-error *ngIf="form.get('referencia')?.hasError('required')">
              La Referencia es requerida
            </mat-error>
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
      fArticulo: [this.data.item?.fArticulo || '', Validators.required],
      
      // Control 'referencia': valor inicial del item o cadena vacía, validador requerido
      referencia: [this.data.item?.referencia || '', Validators.required],
      
      // Control 'estante': valor inicial del item o cadena vacía, validador requerido
      estante: [this.data.item?.estante || '', Validators.required],
      
      // Control 'numeroCarpeta': valor inicial del item o cadena vacía, validador requerido
      numeroCarpeta: [this.data.item?.numeroCarpeta || '', Validators.required]
    });
  }

  /**
   * Cancelar y cerrar el diálogo sin guardar
   * No retorna ningún valor al componente padre
   */
  onCancel(): void {
    // Cerrar el diálogo sin pasar datos (undefined)
    this.dialogRef.close();
  }

  /**
   * Guardar los datos y cerrar el diálogo
   * Retorna los valores del formulario al componente padre
   * Solo se ejecuta si el formulario es válido
   */
  onSave(): void {
    // Verificar que el formulario sea válido (todos los campos requeridos llenos)
    if (this.form.valid) {
      // Cerrar el diálogo y retornar los valores del formulario al componente padre
      this.dialogRef.close(this.form.value);
    }
  }
}
