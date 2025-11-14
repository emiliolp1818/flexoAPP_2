// =====================================================
// VISUALIZADOR DE PDF - FLEXOAPP
// Propósito: Mostrar documentos convertidos a PDF en un diálogo elegante
// Soporta: PDF nativos, Excel convertido, Word convertido
// =====================================================

import { Component, Inject, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

// Interfaz para los datos del diálogo
export interface PdfViewerData {
  documentoId: number;
  fileName: string;
  pdfUrl: string;
}

@Component({
  selector: 'app-pdf-viewer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="pdf-viewer-dialog">
      <!-- Encabezado elegante -->
      <div class="dialog-header">
        <div class="header-left">
          <mat-icon class="file-icon">picture_as_pdf</mat-icon>
          <div class="header-info">
            <h2 class="file-name">{{ data.fileName }}</h2>
            <span class="file-badge">Vista Previa PDF</span>
          </div>
        </div>
        <button mat-icon-button class="close-btn" (click)="onClose()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Contenedor del PDF -->
      <div class="pdf-container">
        <div *ngIf="loading" class="loading-overlay">
          <mat-spinner diameter="50"></mat-spinner>
          <p>Cargando documento...</p>
        </div>
        
        <iframe 
          #pdfIframe
          *ngIf="safePdfUrl"
          [src]="safePdfUrl" 
          class="pdf-iframe"
          (load)="onPdfLoad()"
          frameborder="0">
        </iframe>
      </div>

      <!-- Botones de acción -->
      <div class="dialog-actions">
        <button mat-button class="action-btn secondary-btn" (click)="onClose()">
          <mat-icon>close</mat-icon>
          Cerrar
        </button>
        <button mat-raised-button color="primary" class="action-btn primary-btn" (click)="onDownload()">
          <mat-icon>download</mat-icon>
          Descargar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .pdf-viewer-dialog {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      overflow: hidden;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border-bottom: 2px solid #e2e8f0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      position: relative;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);
      }
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
    }

    .file-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #dc2626;
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      border-radius: 12px;
      padding: 8px;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
    }

    .header-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .file-name {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #1f2937;
      line-height: 1.2;
    }

    .file-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      color: #1e40af;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      border: 1px solid #93c5fd;
      width: fit-content;
    }

    .close-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      transition: all 0.2s ease;
      
      &:hover {
        background: #fee2e2;
        transform: rotate(90deg);
        
        mat-icon {
          color: #dc2626;
        }
      }
      
      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
        color: #64748b;
        transition: color 0.2s ease;
      }
    }

    .pdf-container {
      flex: 1;
      position: relative;
      background: #ffffff;
      margin: 16px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      z-index: 10;
      
      p {
        color: #64748b;
        font-size: 1rem;
        font-weight: 500;
        margin: 0;
      }
    }

    .pdf-iframe {
      width: 100%;
      height: 100%;
      border: none;
      background: #ffffff;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border-top: 1px solid #e2e8f0;
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 600;
      transition: all 0.2s ease;
      
      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
    }

    .secondary-btn {
      background: #f1f5f9;
      color: #475569;
      
      &:hover {
        background: #e2e8f0;
      }
    }

    .primary-btn {
      background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      
      &:hover {
        background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
        box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
      }
    }
  `]
})
export class PdfViewerDialogComponent implements OnInit {
  @ViewChild('pdfIframe') pdfIframe!: ElementRef<HTMLIFrameElement>;
  
  loading = true;
  safePdfUrl: SafeResourceUrl | null = null;

  constructor(
    public dialogRef: MatDialogRef<PdfViewerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PdfViewerData,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Sanitizar la URL del PDF para que Angular la acepte en el iframe
    this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.data.pdfUrl);
  }

  onPdfLoad(): void {
    // Ocultar el spinner cuando el PDF termine de cargar
    // Usar setTimeout para evitar ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => {
      this.loading = false;
      this.cdr.detectChanges();
    }, 0);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onDownload(): void {
    // Descargar el PDF
    const link = document.createElement('a');
    link.href = this.data.pdfUrl;
    link.download = this.data.fileName || 'documento.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
