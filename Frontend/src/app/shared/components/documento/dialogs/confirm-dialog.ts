// =====================================================
// DIÁLOGO DE CONFIRMACIÓN - FLEXOAPP
// Propósito: Mostrar diálogos de confirmación personalizados
// =====================================================

// Importar decoradores y módulos de Angular
import { Component, Inject } from '@angular/core';
// Importar módulos de Angular Material
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

// Interfaz para los datos del diálogo
export interface ConfirmDialogData {
  title: string;           // Título del diálogo
  message: string;         // Mensaje principal
  confirmText?: string;    // Texto del botón de confirmar (opcional)
  cancelText?: string;     // Texto del botón de cancelar (opcional)
  type?: 'warning' | 'danger' | 'info';  // Tipo de diálogo (opcional)
}

// Decorador del componente
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="confirm-dialog">
      <!-- Encabezado del diálogo con icono según el tipo -->
      <h2 mat-dialog-title class="dialog-title" [class.warning]="data.type === 'warning'" 
          [class.danger]="data.type === 'danger'" [class.info]="data.type === 'info'">
        <!-- Icono según el tipo de diálogo -->
        <mat-icon *ngIf="data.type === 'warning'">warning</mat-icon>
        <mat-icon *ngIf="data.type === 'danger'">error</mat-icon>
        <mat-icon *ngIf="data.type === 'info'">info</mat-icon>
        <!-- Título del diálogo -->
        {{ data.title }}
      </h2>

      <!-- Contenido del diálogo -->
      <mat-dialog-content class="dialog-content">
        <!-- Mensaje principal -->
        <p>{{ data.message }}</p>
      </mat-dialog-content>

      <!-- Botones de acción -->
      <mat-dialog-actions align="end" class="dialog-actions">
        <!-- Botón de cancelar -->
        <button mat-button (click)="onCancel()" class="cancel-button">
          {{ data.cancelText || 'Cancelar' }}
        </button>
        <!-- Botón de confirmar con color según el tipo -->
        <button mat-raised-button 
                [color]="data.type === 'danger' ? 'warn' : 'primary'"
                (click)="onConfirm()" 
                class="confirm-button">
          {{ data.confirmText || 'Confirmar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    /* Estilos del diálogo de confirmación */
    .confirm-dialog {
      min-width: 400px;
      max-width: 500px;
    }

    /* Estilos del título según el tipo */
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #1e293b;
      margin: 0;
      padding: 20px 24px 16px;
      font-size: 1.25rem;
      font-weight: 600;

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }

      /* Tipo warning (advertencia) */
      &.warning {
        color: #f59e0b;
        
        mat-icon {
          color: #f59e0b;
        }
      }

      /* Tipo danger (peligro) */
      &.danger {
        color: #ef4444;
        
        mat-icon {
          color: #ef4444;
        }
      }

      /* Tipo info (información) */
      &.info {
        color: #3b82f6;
        
        mat-icon {
          color: #3b82f6;
        }
      }
    }

    /* Estilos del contenido */
    .dialog-content {
      padding: 0 24px 20px;
      color: #475569;
      font-size: 1rem;
      line-height: 1.6;

      p {
        margin: 0;
      }
    }

    /* Estilos de los botones */
    .dialog-actions {
      padding: 16px 24px;
      gap: 12px;

      .cancel-button {
        color: #64748b;
        
        &:hover {
          background-color: #f1f5f9;
        }
      }

      .confirm-button {
        min-width: 100px;
      }
    }
  `]
})
export class ConfirmDialogComponent {
  // Constructor que inyecta la referencia del diálogo y los datos
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  // Método que se ejecuta al hacer clic en Cancelar
  onCancel(): void {
    // Cerrar el diálogo y retornar false (no confirmado)
    this.dialogRef.close(false);
  }

  // Método que se ejecuta al hacer clic en Confirmar
  onConfirm(): void {
    // Cerrar el diálogo y retornar true (confirmado)
    this.dialogRef.close(true);
  }
}
