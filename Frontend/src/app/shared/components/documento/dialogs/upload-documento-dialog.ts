




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
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Inter', system-ui, sans-serif;
    }

    // Título del diálogo — Apple limpio
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
      padding: 18px 22px 12px;
      font-size: 1.15rem;
      font-weight: 600;
      letter-spacing: -0.3px;
      color: #1d1d1f;

      mat-icon { color: #0071e3; }
    }

    mat-dialog-content {
      min-width: 440px;
      max-width: 460px;
      padding: 4px 22px 8px !important;
    }

    // Área de carga — glass minimalista
    .upload-area {
      border: 1.5px dashed rgba(0, 0, 0, 0.16);
      border-radius: 14px;
      padding: 26px 20px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
      background: rgba(118, 118, 128, 0.06);
      margin-bottom: 14px;

      &:hover {
        border-color: #0071e3;
        background: rgba(0, 113, 227, 0.05);
      }

      &.drag-over {
        border-color: #0071e3;
        background: rgba(0, 113, 227, 0.09);
        transform: scale(1.01);
      }

      .upload-icon {
        font-size: 44px;
        width: 44px;
        height: 44px;
        color: #0071e3;
        margin-bottom: 10px;
      }

      .upload-text {
        font-size: 0.92rem;
        font-weight: 600;
        letter-spacing: -0.2px;
        color: #1d1d1f;
        margin: 0 0 4px 0;
      }

      .upload-hint {
        font-size: 0.78rem;
        color: #86868b;
        margin: 0;
      }
    }

    // Información del archivo — chip glass
    .file-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      background: rgba(0, 113, 227, 0.06);
      border: 1px solid rgba(0, 113, 227, 0.16);
      border-radius: 12px;
      margin-bottom: 14px;

      mat-icon {
        color: #0071e3;
        font-size: 28px;
        width: 28px;
        height: 28px;
      }

      .file-details {
        flex: 1;
        min-width: 0;

        .file-name {
          margin: 0;
          font-weight: 600;
          letter-spacing: -0.2px;
          color: #1d1d1f;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-size {
          margin: 2px 0 0 0;
          font-size: 0.78rem;
          color: #86868b;
        }
      }
    }

    // Formulario de metadatos — compacto
    .metadata-form {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .full-width { width: 100%; }
    }

    // Campos estilo iOS (filled discreto, hairline, radio Apple)
    ::ng-deep .metadata-form .mat-mdc-form-field {
      width: 100%;

      .mat-mdc-text-field-wrapper {
        border-radius: 12px !important;
        background: rgba(118, 118, 128, 0.06) !important;
        border: 1px solid rgba(0, 0, 0, 0.08) !important;
        transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
      }
      .mdc-line-ripple::before,
      .mdc-line-ripple::after { display: none !important; }
      .mat-mdc-form-field-focus-overlay { background: transparent !important; }

      &:hover .mat-mdc-text-field-wrapper { border-color: rgba(0, 0, 0, 0.16) !important; }
      &.mat-focused .mat-mdc-text-field-wrapper {
        border-color: #0071e3 !important;
        background: #ffffff !important;
        box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.15) !important;
      }

      .mat-mdc-form-field-infix { min-height: 46px !important; padding-top: 10px !important; padding-bottom: 8px !important; }
      .mat-mdc-floating-label { color: #86868b !important; }
      &.mat-focused .mat-mdc-floating-label { color: #0071e3 !important; }
      input.mat-mdc-input-element, textarea.mat-mdc-input-element,
      .mat-mdc-select-value-text { color: #1d1d1f !important; }
      .mat-mdc-form-field-icon-prefix { color: #86868b !important; }
      &.mat-focused .mat-mdc-form-field-icon-prefix mat-icon { color: #0071e3 !important; }
      .mat-mdc-form-field-subscript-wrapper { display: none !important; }
    }

    ::ng-deep mat-progress-bar {
      border-radius: 999px;
      margin-top: 6px;
      --mdc-linear-progress-active-indicator-color: #0071e3;
    }

    // Acciones — botones Apple
    mat-dialog-actions {
      padding: 12px 22px 18px !important;
      gap: 8px;

      button[mat-button] {
        border-radius: 10px !important;
        color: #6e6e73 !important;
        font-weight: 500 !important;
        letter-spacing: -0.2px !important;
      }
      button[mat-raised-button] {
        background: #0071e3 !important;
        color: #ffffff !important;
        border-radius: 10px !important;
        font-weight: 500 !important;
        letter-spacing: -0.2px !important;
        box-shadow: 0 3px 10px rgba(0, 113, 227, 0.28) !important;
        .mdc-button__label, mat-icon { color: #ffffff !important; }
        &:disabled { opacity: 0.5 !important; box-shadow: none !important; }
      }
    }
  `]
})
export class UploadDocumentoDialogComponent {

  selectedFile = signal<File | null>(null);
  isDragOver = signal<boolean>(false);
  uploading = signal<boolean>(false);


  documentName = '';
  category = 'reportes';
  status = 'active';
  description = '';

  constructor(private dialogRef: MatDialogRef<UploadDocumentoDialogComponent>) {}


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile.set(file);

      this.documentName = file.name.replace(/\.[^/.]+$/, '');
    }
  }


  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }


  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }


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


  clearFile(): void {
    this.selectedFile.set(null);
    this.documentName = '';
  }


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


  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }


  onUpload(): void {
    if (!this.selectedFile() || !this.documentName) return;

    this.uploading.set(true);


    setTimeout(() => {

      const result = {
        file: this.selectedFile(),
        name: this.documentName,
        category: this.category,
        status: this.status,
        description: this.description
      };

      this.dialogRef.close(result);
    }, 1500);
  }


  onCancel(): void {
    this.dialogRef.close();
  }
}
