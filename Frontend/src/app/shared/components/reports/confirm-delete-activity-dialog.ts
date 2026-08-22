import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDeleteActivityData {
  title: string;
  message: string;
  detail?: string;
  confirmText?: string;
}

@Component({
  selector: 'confirm-delete-activity-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="compact-delete-dialog">
      <div class="dialog-header-compact">
        <div class="icon-container">
          <mat-icon class="warning-icon">delete_outline</mat-icon>
        </div>
        <div class="header-text">
          <h2>{{ data.title }}</h2>
        </div>
      </div>

      <div class="dialog-content-compact">
        <p class="message">{{ data.message }}</p>

        <div class="design-info-compact" *ngIf="data.detail">
          <div class="info-item">
            <mat-icon>info</mat-icon>
            <span>{{ data.detail }}</span>
          </div>
        </div>

        <div class="warning-note">
          <mat-icon>info</mat-icon>
          <span>Esta acción no se puede deshacer</span>
        </div>
      </div>

      <div class="dialog-footer-compact">
        <button mat-button (click)="dialogRef.close(false)" class="cancel-btn-compact">
          Cancelar
        </button>
        <button mat-raised-button (click)="dialogRef.close(true)" class="delete-btn-compact">
          <mat-icon>delete</mat-icon>
          {{ data.confirmText || 'Eliminar' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .compact-delete-dialog {
      width: 100%;
      max-width: 380px;
    }

    .dialog-header-compact {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 24px 16px;
      border-bottom: 2px solid #fee2e2;

      .icon-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        border-radius: 12px;
        flex-shrink: 0;

        .warning-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
          color: #ef4444;
        }
      }

      .header-text {
        flex: 1;

        h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          line-height: 1.3;
        }
      }
    }

    .dialog-content-compact {
      padding: 20px 24px;

      .message {
        font-size: 0.95rem;
        color: #374151;
        margin: 0 0 16px 0;
        line-height: 1.5;
      }

      .design-info-compact {
        background: #f9fafb;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 16px;

        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;

          mat-icon {
            color: #6b7280;
            font-size: 18px;
            width: 18px;
            height: 18px;
          }

          span {
            color: #1f2937;
            font-size: 0.875rem;
          }
        }
      }

      .warning-note {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #fef2f2;
        border-left: 3px solid #ef4444;
        border-radius: 4px;
        padding: 10px 12px;

        mat-icon {
          color: #ef4444;
          font-size: 18px;
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        span {
          color: #991b1b;
          font-size: 0.875rem;
          font-weight: 500;
        }
      }
    }

    .dialog-footer-compact {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 16px 24px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;

      .cancel-btn-compact {
        color: #6b7280;
        font-weight: 500;
        padding: 0 20px;

        &:hover {
          background: #f3f4f6;
        }
      }

      .delete-btn-compact {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        font-weight: 500;
        padding: 0 20px;
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          margin-right: 4px;
        }

        &:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
        }
      }
    }
  `]
})
export class ConfirmDeleteActivityDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteActivityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDeleteActivityData
  ) {}
}
