// =====================================================
// DIÁLOGO PARA CREAR DOCUMENTOS - FLEXOAPP
// Propósito: Crear documentos nuevos desde cero
// =====================================================

import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-create-documento-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ isEditMode ? 'edit' : 'add' }}</mat-icon>
      {{ isEditMode ? 'Editar Documento' : 'Crear Nuevo Documento' }}
    </h2>

    <mat-dialog-content>
      <form class="document-form">
        <!-- Nombre del documento -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre del documento</mat-label>
          <input matInput [(ngModel)]="documentName" name="name" 
                 placeholder="Ej: Manual de Usuario" required>
          <mat-icon matPrefix>description</mat-icon>
        </mat-form-field>

        <!-- Tipo de documento -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Tipo de documento</mat-label>
          <mat-select [(ngModel)]="documentType" name="type" required>
            <mat-option value="PDF">
              <mat-icon>picture_as_pdf</mat-icon>
              PDF
            </mat-option>
            <mat-option value="Word">
              <mat-icon>description</mat-icon>
              Word
            </mat-option>
            <mat-option value="Excel">
              <mat-icon>table_chart</mat-icon>
              Excel
            </mat-option>
            <mat-option value="Image">
              <mat-icon>image</mat-icon>
              Imagen
            </mat-option>
          </mat-select>
          <mat-icon matPrefix>category</mat-icon>
        </mat-form-field>

        <!-- Categoría -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Categoría</mat-label>
          <mat-select [(ngModel)]="category" name="category" required>
            <mat-option value="reportes">Reportes</mat-option>
            <mat-option value="formatos">Formatos</mat-option>
            <mat-option value="tecnicos">Técnicos</mat-option>
            <mat-option value="otros">Otros</mat-option>
          </mat-select>
          <mat-icon matPrefix>folder</mat-icon>
        </mat-form-field>

        <!-- Estado -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Estado</mat-label>
          <mat-select [(ngModel)]="status" name="status" required>
            <mat-option value="active">
              <mat-icon style="color: #15803d;">check_circle</mat-icon>
              Activo
            </mat-option>
            <mat-option value="draft">
              <mat-icon style="color: #a16207;">edit</mat-icon>
              Borrador
            </mat-option>
            <mat-option value="archived">
              <mat-icon style="color: #64748b;">archive</mat-icon>
              Archivado
            </mat-option>
          </mat-select>
          <mat-icon matPrefix>info</mat-icon>
        </mat-form-field>

        <!-- URL del documento (opcional) -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>URL del documento (opcional)</mat-label>
          <input matInput [(ngModel)]="documentUrl" name="url" 
                 placeholder="https://ejemplo.com/documento.pdf">
          <mat-icon matPrefix>link</mat-icon>
        </mat-form-field>

        <!-- Descripción (opcional) -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descripción (opcional)</mat-label>
          <textarea matInput [(ngModel)]="description" name="description" 
                    rows="3" placeholder="Descripción del documento"></textarea>
          <mat-icon matPrefix>notes</mat-icon>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        Cancelar
      </button>
      <button mat-raised-button color="primary" 
              (click)="onCreate()" 
              [disabled]="!isFormValid()">
        <mat-icon>save</mat-icon>
        {{ isEditMode ? 'Guardar Cambios' : 'Crear Documento' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    // Formulario de documento
    .document-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 8px 0;

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
      max-height: 600px;
      padding: 20px 24px;
    }

    // Acciones del diálogo
    mat-dialog-actions {
      padding: 16px 24px;
    }

    // Iconos en las opciones del select
    mat-option {
      mat-icon {
        margin-right: 8px;
        vertical-align: middle;
      }
    }
  `]
})
export class CreateDocumentoDialogComponent implements OnInit {
  // Datos del formulario
  documentName = ''; // Nombre del documento
  documentType = 'PDF'; // Tipo de documento por defecto
  category = 'reportes'; // Categoría por defecto
  status = 'draft'; // Estado por defecto (borrador)
  documentUrl = ''; // URL del documento (opcional)
  description = ''; // Descripción del documento
  
  // Modo de edición (true si se están editando datos existentes)
  isEditMode = false;

  constructor(
    private dialogRef: MatDialogRef<CreateDocumentoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any // Datos del documento a editar (opcional)
  ) {}
  
  // Inicializar componente
  ngOnInit(): void {
    // Si se recibieron datos, estamos en modo edición
    if (this.data) {
      this.isEditMode = true;
      // Cargar datos del documento a editar
      this.documentName = this.data.name || '';
      this.documentType = this.data.type || 'PDF';
      this.category = this.data.category || 'reportes';
      this.status = this.data.status || 'draft';
      this.documentUrl = this.data.url || '';
      this.description = this.data.description || '';
    }
  }

  // Validar formulario
  isFormValid(): boolean {
    return this.documentName.trim() !== '' && 
           this.documentType !== '' && 
           this.category !== '' && 
           this.status !== '';
  }

  // Crear documento
  onCreate(): void {
    if (!this.isFormValid()) return;

    const result = {
      name: this.documentName,
      type: this.documentType,
      category: this.category,
      status: this.status,
      url: this.documentUrl || undefined,
      description: this.description || undefined,
      size: '0 KB', // Tamaño por defecto para documentos nuevos
      createdDate: new Date()
    };

    this.dialogRef.close(result);
  }

  // Cancelar
  onCancel(): void {
    this.dialogRef.close();
  }
}
