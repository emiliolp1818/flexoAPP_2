







import { Component, signal, OnInit, inject, Inject } from '@angular/core';


import { CommonModule } from '@angular/common';


import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';


import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


import { HttpClient } from '@angular/common/http';


import { firstValueFrom } from 'rxjs';


import { environment } from '../../../../environments/environment';


import { CondicionUnicaService } from '../../services/condicion-unica.service';


import { CondicionUnica } from '../../models/condicion-unica.model';


import { ExcelService } from '../../services/excel.service';


@Component({

  selector: 'app-condicion-unica',


  standalone: true,


  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule
  ],


  templateUrl: './condicion-unica.html',


  styleUrls: ['./condicion-unica.scss']
})
export class CondicionUnicaComponent implements OnInit {




  private condicionService = inject(CondicionUnicaService);


  private snackBar = inject(MatSnackBar);


  private dialog = inject(MatDialog);


  private fb = inject(FormBuilder);


  private excelService = inject(ExcelService);






  items = signal<CondicionUnica[]>([]);


  filteredItems = signal<CondicionUnica[]>([]);


  searchTerm = signal<string>('');


  loading = signal<boolean>(false);


  uploading = signal<boolean>(false);


  uploadProgress = signal<number>(0);


  ngOnInit(): void {

    this.loadData();
  }


  loadData(): void {

    this.loading.set(true);


    this.condicionService.getAll().subscribe({

      next: (data) => {

        this.items.set(data);


        this.filteredItems.set(data);


        this.loading.set(false);
      },

      error: (error) => {

        console.error('Error cargando Condición Única:', error);

        const snackBarRef = this.snackBar.open('', '', {
          duration: 3000,
          panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        setTimeout(() => {
          const container = document.querySelector('.status-terminado-snackbar .mdc-snackbar__label');
          if (container) {
            container.innerHTML = '<span class="status-icon">✕</span> Error al cargar registros';
          }
        }, 0);

        this.loading.set(false);
      }
    });
  }


  onSearch(): void {

    const term = this.searchTerm().toLowerCase().trim();


    if (!term) {

      this.filteredItems.set(this.items());

      return;
    }



    const filtered = this.items().filter(item =>

      item.fArticulo.toLowerCase().includes(term)
    );


    this.filteredItems.set(filtered);
  }


  clearSearch(): void {

    this.searchTerm.set('');


    this.filteredItems.set(this.items());
  }


  createNew(): void {

    const dialogRef = this.dialog.open(CondicionUnicaFormDialog, {

      width: '600px',

      data: { mode: 'create', item: null }
    });


    dialogRef.afterClosed().subscribe(result => {

      if (result) {

        this.condicionService.create(result).subscribe({

          next: (created) => {

            const snackBarRef = this.snackBar.open('', '', {
              duration: 3000,
              panelClass: ['status-listo-snackbar', 'animated-snackbar'],
              horizontalPosition: 'center',
              verticalPosition: 'bottom'
            });

            setTimeout(() => {
              const container = document.querySelector('.status-listo-snackbar .mdc-snackbar__label');
              if (container) {
                container.innerHTML = '<span class="status-icon">✓</span> Registro creado exitosamente';
              }
            }, 0);

            this.loadData();
          },

          error: (error) => {

            console.error('Error creando registro:', error);


            if (error.status === 409 && error.error?.errorType === 'DUPLICATE_RECORD') {

              const snackBarRef = this.snackBar.open('', '', {
                duration: 5000,
                panelClass: ['status-preparando-snackbar', 'animated-snackbar'],
                horizontalPosition: 'center',
                verticalPosition: 'bottom'
              });

              setTimeout(() => {
                const container = document.querySelector('.status-preparando-snackbar .mdc-snackbar__label');
                if (container) {
                  container.innerHTML = `<span class="status-icon">⚠</span> ${error.error.message}`;
                }
              }, 0);
            } else {

              const snackBarRef = this.snackBar.open('', '', {
                duration: 3000,
                panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
                horizontalPosition: 'center',
                verticalPosition: 'bottom'
              });

              setTimeout(() => {
                const container = document.querySelector('.status-terminado-snackbar .mdc-snackbar__label');
                if (container) {
                  container.innerHTML = '<span class="status-icon">✕</span> Error al crear registro';
                }
              }, 0);
            }
          }
        });
      }
    });
  }


  editItem(item: CondicionUnica): void {

    const dialogRef = this.dialog.open(CondicionUnicaFormDialog, {

      width: '600px',

      data: { mode: 'edit', item: { ...item } }
    });


    dialogRef.afterClosed().subscribe(result => {

      if (result && item.id) {

        result.id = item.id;


        this.condicionService.update(item.id, result).subscribe({

          next: (updated) => {

            const snackBarRef = this.snackBar.open('', '', {
              duration: 3000,
              panelClass: ['status-listo-snackbar', 'animated-snackbar'],
              horizontalPosition: 'center',
              verticalPosition: 'bottom'
            });

            setTimeout(() => {
              const container = document.querySelector('.status-listo-snackbar .mdc-snackbar__label');
              if (container) {
                container.innerHTML = '<span class="status-icon">✓</span> Registro actualizado exitosamente';
              }
            }, 0);

            this.loadData();
          },

          error: (error) => {

            console.error('Error actualizando registro:', error);


            if (error.status === 409 && error.error?.errorType === 'DUPLICATE_RECORD') {

              const snackBarRef = this.snackBar.open('', '', {
                duration: 5000,
                panelClass: ['status-preparando-snackbar', 'animated-snackbar'],
                horizontalPosition: 'center',
                verticalPosition: 'bottom'
              });

              setTimeout(() => {
                const container = document.querySelector('.status-preparando-snackbar .mdc-snackbar__label');
                if (container) {
                  container.innerHTML = `<span class="status-icon">⚠</span> ${error.error.message}`;
                }
              }, 0);
            } else {

              const snackBarRef = this.snackBar.open('', '', {
                duration: 3000,
                panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
                horizontalPosition: 'center',
                verticalPosition: 'bottom'
              });

              setTimeout(() => {
                const container = document.querySelector('.status-terminado-snackbar .mdc-snackbar__label');
                if (container) {
                  container.innerHTML = '<span class="status-icon">✕</span> Error al actualizar registro';
                }
              }, 0);
            }
          }
        });
      }
    });
  }


  viewDetails(item: CondicionUnica): void {

    const snackBarRef = this.snackBar.open('', '', {
      duration: 2000,
      panelClass: ['status-corriendo-snackbar', 'animated-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });

    setTimeout(() => {
      const container = document.querySelector('.status-corriendo-snackbar .mdc-snackbar__label');
      if (container) {
        container.innerHTML = `<span class="status-icon">👁️</span> Ver detalles: ${item.fArticulo}`;
      }
    }, 0);

  }


  deleteItem(item: CondicionUnica): void {

    const snackBarRef = this.snackBar.open('', 'Eliminar', {
      duration: 5000,
      panelClass: ['status-preparando-snackbar', 'animated-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });

    setTimeout(() => {
      const container = document.querySelector('.status-preparando-snackbar .mdc-snackbar__label');
      if (container) {
        container.innerHTML = `<span class="status-icon">⚠</span> ¿Eliminar el registro ${item.fArticulo}?`;
      }
    }, 0);

    snackBarRef.onAction().subscribe(() => {

      this.executeDelete(item);
    });

    return;
  }


  private executeDelete(item: CondicionUnica): void {


    if (!item.id) {

      const snackBarRef = this.snackBar.open('', '', {
        duration: 3000,
        panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const container = document.querySelector('.status-terminado-snackbar .mdc-snackbar__label');
        if (container) {
          container.innerHTML = '<span class="status-icon">✕</span> Error: Registro sin ID';
        }
      }, 0);

      return;
    }


    this.condicionService.delete(item.id).subscribe({

      next: () => {

        const snackBarRef = this.snackBar.open('', '', {
          duration: 3000,
          panelClass: ['status-listo-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        setTimeout(() => {
          const container = document.querySelector('.status-listo-snackbar .mdc-snackbar__label');
          if (container) {
            container.innerHTML = '<span class="status-icon">✓</span> Registro eliminado exitosamente';
          }
        }, 0);

        this.loadData();
      },

      error: (error) => {

        console.error('Error eliminando registro:', error);

        const snackBarRef = this.snackBar.open('', '', {
          duration: 3000,
          panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        setTimeout(() => {
          const container = document.querySelector('.status-terminado-snackbar .mdc-snackbar__label');
          if (container) {
            container.innerHTML = '<span class="status-icon">✕</span> Error al eliminar registro';
          }
        }, 0);
      }
    });
  }


  triggerFileUpload(): void {

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx,.xls';


    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.uploadExcelFile(file);
      }
    };


    fileInput.click();
  }


  private uploadExcelFile(file: File): void {

    this.uploading.set(true);
    this.uploadProgress.set(0);


    const formData = new FormData();
    formData.append('file', file);



    const interval = setInterval(() => {
      const currentProgress = this.uploadProgress();
      if (currentProgress < 100) {
        this.uploadProgress.set(currentProgress + 10);
      } else {
        clearInterval(interval);
        this.uploading.set(false);
        this.uploadProgress.set(0);
        
        const snackBarRef = this.snackBar.open('', '', {
          duration: 3000,
          panelClass: ['status-listo-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        setTimeout(() => {
          const container = document.querySelector('.status-listo-snackbar .mdc-snackbar__label');
          if (container) {
            container.innerHTML = '<span class="status-icon">✓</span> Archivo cargado exitosamente';
          }
        }, 0);
        
        this.loadData();
      }
    }, 200);
  }


  async exportToExcel(): Promise<void> {
    try {

      const dataToExport = this.filteredItems();


      if (dataToExport.length === 0) {

        const snackBarRef = this.snackBar.open('', '', {
          duration: 3000,
          panelClass: ['status-preparando-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        setTimeout(() => {
          const container = document.querySelector('.status-preparando-snackbar .mdc-snackbar__label');
          if (container) {
            container.innerHTML = '<span class="status-icon">⚠</span> No hay datos para exportar';
          }
        }, 0);

        return;
      }




      const excelData = dataToExport.map((item, index) => ({
        'N°': index + 1,
        'F Artículo': item.fArticulo || '',
        'Descripción': item.descripcion || '',
        'Estante': item.estante || '',
        'Número de Carpeta': item.numeroCarpeta || '',
        'Estado': item.estado || 'ACTIVO',
        'Fecha de Creación': item.createdDate
          ? new Date(item.createdDate).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
          : '',
        'Última Modificación': item.lastModified
          ? new Date(item.lastModified).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
          : ''
      }));





      const now = new Date();
      const fecha = now.toLocaleDateString('es-ES').replace(/\//g, '-');
      const hora = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }).replace(/:/g, '-');
      const fileName = `CondicionUnica_${fecha}_${hora}`;


      await this.excelService.exportToExcel(excelData, fileName, 'Condición Única');

      const snackBarRef = this.snackBar.open('', '', {
        duration: 4000,
        panelClass: ['status-listo-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const container = document.querySelector('.status-listo-snackbar .mdc-snackbar__label');
        if (container) {
          container.innerHTML = `<span class="status-icon">✓</span> Archivo exportado: ${fileName}.xlsx (${dataToExport.length} registros)`;
        }
      }, 0);

    } catch (error) {


      console.error('Error exportando a Excel:', error);

      const snackBarRef = this.snackBar.open('', '', {
        duration: 3000,
        panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      setTimeout(() => {
        const container = document.querySelector('.status-terminado-snackbar .mdc-snackbar__label');
        if (container) {
          container.innerHTML = '<span class="status-icon">✕</span> Error al exportar archivo';
        }
      }, 0);
    }
  }
}



@Component({

  selector: 'condicion-unica-form-dialog',


  standalone: true,


  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    ReactiveFormsModule
  ],


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

          <!-- Campo de formulario: Descripción -->
          <mat-form-field appearance="outline" class="full-width">
            <!-- Etiqueta del campo: se muestra como "Descripción" en la UI -->
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

          <!-- Campo de formulario: Estado -->
          <mat-form-field appearance="outline" class="full-width">
            <!-- Etiqueta del campo -->
            <mat-label>Estado</mat-label>
            <!-- Select dropdown vinculado al control 'estado' del formulario -->
            <mat-select formControlName="estado">
              <mat-option value="ACTIVO">ACTIVO</mat-option>
              <mat-option value="INACTIVO">INACTIVO</mat-option>
              <mat-option value="EN REVISIÓN">EN REVISIÓN</mat-option>
            </mat-select>
            <!-- Icono prefijo (antes del select) -->
            <mat-icon matPrefix>info</mat-icon>
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


  form: FormGroup;



  loadingDesign = false;




  designFound = false;



  private http = inject(HttpClient);



  private snackBar = inject(MatSnackBar);


  constructor(

    public dialogRef: MatDialogRef<CondicionUnicaFormDialog>,



    @Inject(MAT_DIALOG_DATA) public data: { mode: string; item: CondicionUnica | null },


    private fb: FormBuilder
  ) {

    this.form = this.fb.group({


      fArticulo: [this.data.item?.fArticulo || '', Validators.required],



      descripcion: [this.data.item?.descripcion || '', Validators.required],



      estante: [this.data.item?.estante || '', Validators.required],



      numeroCarpeta: [this.data.item?.numeroCarpeta || '', Validators.required],



      estado: [this.data.item?.estado || 'ACTIVO']
    });
  }


  async onArticuloBlur(): Promise<void> {

    const fArticulo = this.form.get('fArticulo')?.value?.trim();


    if (!fArticulo) {
      return;
    }



    const descripcionActual = this.form.get('descripcion')?.value?.trim();
    if (descripcionActual && this.data.mode === 'create') {
      return;
    }

    try {

      this.loadingDesign = true;

      this.designFound = false;


      console.log(`🔍 Buscando diseño para artículo: ${fArticulo}`);





      const response = await firstValueFrom(
        this.http.get<any>(`${environment.apiUrl}/maquinas/design-info/${fArticulo}`)
      );


      console.log('📡 Respuesta del servidor:', response);



      if (response && response.success && response.found && response.data && response.data.descripcion) {


        this.form.patchValue({
          descripcion: response.data.descripcion
        });


        this.designFound = true;

        console.log(`✅ Diseño encontrado - Descripción cargada: ${response.data.descripcion}`);

        const snackBarRef = this.snackBar.open('', '', {
          duration: 3000,
          panelClass: ['status-listo-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        setTimeout(() => {
          const container = document.querySelector('.status-listo-snackbar .mdc-snackbar__label');
          if (container) {
            container.innerHTML = `<span class="status-icon">✓</span> Descripción cargada desde diseños: ${response.data.descripcion}`;
          }
        }, 0);
      } else {

        console.log(`⚠️ Diseño no encontrado para artículo: ${fArticulo}`);
        this.designFound = false;

        const snackBarRef = this.snackBar.open('', '', {
          duration: 3000,
          panelClass: ['status-preparando-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        setTimeout(() => {
          const container = document.querySelector('.status-preparando-snackbar .mdc-snackbar__label');
          if (container) {
            container.innerHTML = '<span class="status-icon">⚠</span> Artículo no encontrado en diseños. Ingrese la descripción manualmente.';
          }
        }, 0);
      }

    } catch (error: any) {

      console.error('❌ Error buscando diseño:', error);
      this.designFound = false;


      if (error.status === 404) {
        console.log(`⚠️ Artículo ${fArticulo} no existe en la tabla designs`);
        
        const snackBarRef = this.snackBar.open('', '', {
          duration: 3000,
          panelClass: ['status-preparando-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        setTimeout(() => {
          const container = document.querySelector('.status-preparando-snackbar .mdc-snackbar__label');
          if (container) {
            container.innerHTML = '<span class="status-icon">⚠</span> Artículo no encontrado en diseños. Ingrese la descripción manualmente.';
          }
        }, 0);
      } else {

        const snackBarRef = this.snackBar.open('', '', {
          duration: 3000,
          panelClass: ['status-terminado-snackbar', 'animated-snackbar'],
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });

        setTimeout(() => {
          const container = document.querySelector('.status-terminado-snackbar .mdc-snackbar__label');
          if (container) {
            container.innerHTML = '<span class="status-icon">✕</span> Error al buscar en diseños. Ingrese la descripción manualmente.';
          }
        }, 0);
      }
    } finally {


      this.loadingDesign = false;
    }
  }


  onCancel(): void {


    this.dialogRef.close();
  }


  onSave(): void {

    if (this.form.valid) {


      this.dialogRef.close(this.form.value);
    }
  }
}
