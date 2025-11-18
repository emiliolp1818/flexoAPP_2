import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDeleteData {
  articleF: string;
  client: string;
  description: string;
}

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="confirm-delete-dialog">
      <!-- Header con icono de advertencia -->
      <div class="dialog-header-warning">
        <mat-icon class="warning-icon">warning</mat-icon>
        <h2>Confirmar Eliminación</h2>
      </div>

      <!-- Contenido del diálogo -->
      <div class="dialog-content-warning">
        <p class="warning-message">
          ¿Está seguro de que desea eliminar este diseño?
        </p>
        
        <div class="design-info">
          <div class="info-row">
            <mat-icon>article</mat-icon>
            <span class="label">Artículo F:</span>
            <span class="value">{{ data.articleF }}</span>
          </div>
          <div class="info-row">
            <mat-icon>business</mat-icon>
            <span class="label">Cliente:</span>
            <span class="value">{{ data.client }}</span>
          </div>
          <div class="info-row">
            <mat-icon>description</mat-icon>
            <span class="label">Descripción:</span>
            <span class="value">{{ data.description }}</span>
          </div>
        </div>

        <div class="warning-box">
          <mat-icon>error_outline</mat-icon>
          <p>Esta acción es <strong>PERMANENTE</strong> y no se puede deshacer.</p>
        </div>
      </div>

      <!-- Footer con botones -->
      <div class="dialog-footer-warning">
        <button mat-button (click)="onCancel()" class="cancel-btn">
          <mat-icon>close</mat-icon>
          Cancelar
        </button>
        <button mat-raised-button color="warn" (click)="onConfirm()" class="delete-btn">
          <mat-icon>delete_forever</mat-icon>
          Eliminar Diseño
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-delete-dialog {
      min-width: 500px;
      max-width: 600px;
    }

    .dialog-header-warning {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 24px;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      margin: -24px -24px 0 -24px;
      border-radius: 4px 4px 0 0;

      .warning-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        animation: pulse 2s infinite;
      }

      h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
      }
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
    }

    .dialog-content-warning {
      padding: 24px;

      .warning-message {
        font-size: 1.1rem;
        color: #1f2937;
        margin: 0 0 20px 0;
        font-weight: 500;
      }

      .design-info {
        background: #f9fafb;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 20px;

        .info-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;

          &:last-child {
            border-bottom: none;
          }

          mat-icon {
            color: #6b7280;
            font-size: 20px;
            width: 20px;
            height: 20px;
          }

          .label {
            font-weight: 600;
            color: #4b5563;
            min-width: 100px;
          }

          .value {
            color: #1f2937;
            flex: 1;
          }
        }
      }

      .warning-box {
        display: flex;
        align-items: center;
        gap: 12px;
        background: #fef2f2;
        border: 2px solid #fecaca;
        border-radius: 8px;
        padding: 16px;

        mat-icon {
          color: #ef4444;
          font-size: 24px;
          width: 24px;
          height: 24px;
        }

        p {
          margin: 0;
          color: #991b1b;
          font-size: 0.95rem;

          strong {
            font-weight: 700;
          }
        }
      }
    }

    .dialog-footer-warning {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      background: #f9fafb;
      margin: 0 -24px -24px -24px;
      border-radius: 0 0 4px 4px;

      .cancel-btn {
        color: #6b7280;
        border: 1px solid #d1d5db;

        &:hover {
          background: #f3f4f6;
        }
      }

      .delete-btn {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);

        &:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
        }
      }
    }
  `]
})
export class ConfirmDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDeleteData
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
