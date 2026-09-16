




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

    // Contenido del diálogo — compacto
    mat-dialog-content {
      min-width: 440px;
      max-width: 460px;
      max-height: 70vh;
      padding: 4px 22px 8px !important;
    }

    // Formulario compacto
    .document-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 6px 0;

      .full-width { width: 100%; }
    }

    // Campos estilo iOS (filled discreto, hairline, radio Apple)
    ::ng-deep .document-form .mat-mdc-form-field {
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

    // Iconos en las opciones del select
    mat-option mat-icon {
      margin-right: 8px;
      vertical-align: middle;
    }
  `]
})
export class CreateDocumentoDialogComponent implements OnInit {

  documentName = '';
  documentType = 'PDF';
  category = 'reportes';
  status = 'draft';
  documentUrl = '';
  description = '';


  isEditMode = false;

  constructor(
    private dialogRef: MatDialogRef<CreateDocumentoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}


  ngOnInit(): void {

    if (this.data) {
      this.isEditMode = true;

      this.documentName = this.data.name || '';
      this.documentType = this.data.type || 'PDF';
      this.category = this.data.category || 'reportes';
      this.status = this.data.status || 'draft';
      this.documentUrl = this.data.url || '';
      this.description = this.data.description || '';
    }
  }


  isFormValid(): boolean {
    return this.documentName.trim() !== '' &&
           this.documentType !== '' &&
           this.category !== '' &&
           this.status !== '';
  }


  onCreate(): void {
    if (!this.isFormValid()) return;

    const result = {
      name: this.documentName,
      type: this.documentType,
      category: this.category,
      status: this.status,
      url: this.documentUrl || undefined,
      description: this.description || undefined,
      size: '0 KB',
      createdDate: new Date()
    };

    this.dialogRef.close(result);
  }


  onCancel(): void {
    this.dialogRef.close();
  }
}
