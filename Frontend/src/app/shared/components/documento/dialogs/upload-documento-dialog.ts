// =====================================================
// DIÁLOGO PARA SUBIR DOCUMENTOS - FLEXOAPP
// Propósito: Permitir la carga de archivos al sistema
// =====================================================

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-upload-documento-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>upload_file</mat-icon>
      Subir Documento
    </h2>

    <mat-dialog-content>
      <!-- Área de arrastrar y soltar archivo -->
      <div class="upload-area" 
           (click)="fileInput.click()"
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)"
           [class.drag-over]="isDragOver()">
        <mat-icon class="upload-icon">cloud_upload</mat-icon>
        <p class="upload-text">
          {{ selectedFile() ? selectedFile()!.name : 'Arrastra un archivo aquí o haz clic para seleccionar' }}
        </p>
        <p class="upload-hint" *ngIf="!selectedFile()">
          Formatos soportados: PDF, Word, Excel, Imágenes
        </p>
        <input #fileInput type="file" hidden (change)="onFileSelected($event)"
               accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg">
      </div>

      <!-- Información del archivo seleccionado -->
      <div *ngIf="selectedFile()" class="file-info">
        <mat-icon>{{ getFileIcon() }}</mat-icon>
        <div class="file-details">
          <p class="file-name">{{ selectedFile()!.name }}</p>
          <p class="file-size">{{ formatFileSize(selectedFile()!.size) }}</p>
        </div>
        <button mat-icon-button (click)="clearFile()" matTooltip="Quitar archivo">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Formulario de metadatos -->
      <div class="metadata-form" *ngIf="selectedFile()">
        <!-- Nombre del documento -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre del documento</mat-label>
          <input matInput [(ngModel)]="documentName" placeholder="Ej: Manual de Usuario">
          <mat-icon matPrefix>description</mat-icon>
        </mat-form-field>

        <!-- Categoría -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Categoría</mat-label>
          <mat-select [(ngModel)]="category">
            <mat-option value="reportes">Reportes</mat-option>
            <mat-option value="formatos">Formatos</mat-option>
            <mat-option value="tecnicos">Técnicos</mat-option>
            <mat-option value="otros">Otros</mat-option>
          </mat-select>
          <mat-icon matPrefix>category</mat-icon>
        </mat-form-field>

        <!-- Descripción -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descripción</mat-label>
          <textarea matInput [(ngModel)]="description" 
                    rows="3" 
                    placeholder="Descripción del documento"></textarea>
          <mat-icon matPrefix>notes</mat-icon>
        </mat-form-field>

        <!-- Estado -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Estado</mat-label>
          <mat-select [(ngModel)]="status">
            <mat-option value="active">Activo</mat-option>
            <mat-option value="draft">Borrador</mat-option>
            <mat-option value="archived">Archivado</mat-option>
          </mat-select>
          <mat-icon matPrefix>info</mat-icon>
        </mat-form-field>
      </div>

      <!-- Barra de progreso -->
      <mat-progress-bar *ngIf="uploading()" mode="indeterminate"></mat-progress-bar>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()" [disabled]="uploading()">
        Cancelar
      </button>
      <button mat-raised-button color="primary" 
              (click)="onUpload()" 
              [disabled]="!selectedFile() || !documentName || uploading()">
        <mat-icon>upload</mat-icon>
        Subir Documento
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    // Área de carga de archivos
    .upload-area {
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #f8fafc;
      margin-bottom: 20px;

      &:hover {
        border-color: #2563eb;
        background: #eff6ff;
      }

      &.drag-over {
        border-color: #2563eb;
        background: #dbeafe;
        transform: scale(1.02);
      }

      .upload-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #64748b;
        margin-bottom: 16px;
      }

      .upload-text {
        font-size: 1rem;
        font-weight: 600;
        color: #334155;
        margin: 0 0 8px 0;
      }

      .upload-hint {
        font-size: 0.875rem;
        color: #64748b;
        margin: 0;
      }
    }

    // Información del archivo
    .file-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f1f5f9;
      border-radius: 8px;
      margin-bottom: 20px;

      mat-icon {
        color: #2563eb;
        font-size: 32px;
        width: 32px;
        height: 32px;
      }

      .file-details {
        flex: 1;

        .file-name {
          margin: 0;
          font-weight: 600;
          color: #1e293b;
        }

        .file-size {
          margin: 4px 0 0 0;
          font-size: 0.875rem;
          color: #64748b;
        }
      }
    }

    // Formulario de metadatos
    .metadata-form {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .full-width {
        width: 100%;
      }
    }

    // Título del diálogo
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #1e293b;

      mat-icon {
        color: #2563eb;
      }
    }

    // Contenido del diálogo
    mat-dialog-content {
      min-width: 500px;
      padding: 20px 24px;
    }

    // Acciones del diálogo
    mat-dialog-actions {
      padding: 16px 24px;
    }
  `]
})
export class UploadDocumentoDialogComponent {
  // Signals para estado reactivo
  selectedFile = signal<File | null>(null);
  isDragOver = signal<boolean>(false);
  uploading = signal<boolean>(false);

  // Datos del formulario
  documentName = '';
  category = 'reportes';
  status = 'active';
  description = '';

  constructor(private dialogRef: MatDialogRef<UploadDocumentoDialogComponent>) {}

  // Manejar selección de archivo
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile.set(file);
      // Usar el nombre del archivo como nombre del documento por defecto
      this.documentName = file.name.replace(/\.[^/.]+$/, '');
    }
  }

  // Manejar arrastrar sobre el área
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  // Manejar salir del área de arrastre
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  // Manejar soltar archivo
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.selectedFile.set(file);
      this.documentName = file.name.replace(/\.[^/.]+$/, '');
    }
  }

  // Limpiar archivo seleccionado
  clearFile(): void {
    this.selectedFile.set(null);
    this.documentName = '';
  }

  // Obtener icono según tipo de archivo
  getFileIcon(): string {
    const file = this.selectedFile();
    if (!file) return 'insert_drive_file';

    const extension = file.name.split('.').pop()?.toLowerCase();
    const icons: { [key: string]: string } = {
      'pdf': 'picture_as_pdf',
      'doc': 'description',
      'docx': 'description',
      'xls': 'table_chart',
      'xlsx': 'table_chart',
      'png': 'image',
      'jpg': 'image',
      'jpeg': 'image'
    };
    return icons[extension || ''] || 'insert_drive_file';
  }

  // Formatear tamaño de archivo
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Subir documento
  onUpload(): void {
    if (!this.selectedFile() || !this.documentName) return;

    this.uploading.set(true);

    // Simular carga (aquí iría la llamada al backend)
    setTimeout(() => {
      // Preparar resultado con todos los datos del formulario
      const result = {
        file: this.selectedFile(), // Archivo seleccionado
        name: this.documentName, // Nombre del documento
        category: this.category, // Categoría seleccionada
        status: this.status, // Estado seleccionado
        description: this.description // Descripción del documento
      };
      // Cerrar diálogo y devolver resultado
      this.dialogRef.close(result);
    }, 1500);
  }

  // Cancelar
  onCancel(): void {
    this.dialogRef.close();
  }
}
