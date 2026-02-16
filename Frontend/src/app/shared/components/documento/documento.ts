





import { Component, signal, computed, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { HttpClientModule } from '@angular/common/http';

import { UploadDocumentoDialogComponent } from './dialogs/upload-documento-dialog';
import { CreateDocumentoDialogComponent } from './dialogs/create-documento-dialog';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog';
import { PdfViewerDialogComponent } from './dialogs/pdf-viewer-dialog';

import { DocumentoService } from '../../services/documento.service';

import { Documento } from '../../models/documento.model';

import { environment } from '../../../../environments/environment';





@Component({
  selector: 'app-documento',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    HttpClientModule
  ],
  templateUrl: './documento.html',
  styleUrls: ['./documento.scss']
})
export class DocumentoComponent implements OnInit {




  documents = signal<Documento[]>([]);


  loading = signal<boolean>(true);


  searchTerm = signal<string>('');
  selectedCategory = signal<string>('all');
  selectedStatus = signal<string>('all');
  isSearching = signal<boolean>(false);





  filteredDocuments = computed(() => {
    let filtered = this.documents();


    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(doc =>
        doc.nombre.toLowerCase().includes(term) ||
        doc.tipo.toLowerCase().includes(term)
      );
    }


    if (this.selectedCategory() !== 'all') {
      filtered = filtered.filter(doc => doc.categoria === this.selectedCategory());
    }


    if (this.selectedStatus() !== 'all') {
      filtered = filtered.filter(doc => doc.estado === this.selectedStatus());
    }

    return filtered;
  });




  categories = [
    { value: 'all', label: 'Todas las categorías' },
    { value: 'reportes', label: 'Reportes' },
    { value: 'formatos', label: 'Formatos' },
    { value: 'tecnicos', label: 'Técnicos' },
    { value: 'otros', label: 'Otros' }
  ];


  statuses = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activos' },
    { value: 'draft', label: 'Borradores' },
    { value: 'archived', label: 'Archivados' }
  ];


  displayedColumns: string[] = ['name', 'type', 'category', 'description', 'size', 'createdDate', 'status', 'actions'];



  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private documentoService: DocumentoService
  ) {}



  ngOnInit(): void {
    this.loadDocuments();
  }




  private loadDocuments(): void {
    this.loading.set(true);


    this.documentoService.getAll().subscribe({

      next: (documentos) => {
        this.documents.set(documentos);
        this.loading.set(false);
      },

      error: (error) => {

        if (!environment.production) {
          console.error('✗ Error al cargar documentos:', error);
        }

        this.showMessage('✗ Error al cargar documentos. Por favor, intente nuevamente.');
        this.loading.set(false);
        this.documents.set([]);
      }
    });
  }




  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.isSearching.set(input.value.length > 0);
  }


  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
  }


  onStatusChange(status: string): void {
    this.selectedStatus.set(status);
  }


  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedCategory.set('all');
    this.selectedStatus.set('all');
    this.isSearching.set(false);
    this.showMessage('✓ Filtros limpiados');
  }




  uploadDocument(): void {

    const dialogRef = this.dialog.open(UploadDocumentoDialogComponent, {
      width: '600px',
      disableClose: false
    });


    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        const metadata: Partial<Documento> = {
          nombre: result.name,
          tipo: this.getFileType(result.file.name),
          categoria: result.category,
          estado: result.status,
          descripcion: result.description
        };


        this.documentoService.uploadFile(result.file, metadata).subscribe({

          next: (documentoCreado) => {

            this.showMessage(`✓ Documento "${documentoCreado.nombre}" subido correctamente`);


            this.loadDocuments();
          },

          error: (error) => {

            if (!environment.production) {
              console.error('✗ Error al subir documento:', error);
            }

            this.showMessage('✗ Error al subir el documento. Por favor, intente nuevamente.');


            this.loadDocuments();
          }
        });
      }
    });
  }


  createNewDocument(): void {

    const dialogRef = this.dialog.open(CreateDocumentoDialogComponent, {
      width: '600px',
      disableClose: false
    });


    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        const nuevoDocumento: Partial<Documento> = {
          nombre: result.name,
          tipo: result.type,
          categoria: result.category,
          estado: result.status,
          descripcion: result.description,
          rutaArchivo: result.url,
          tamanoFormateado: result.size
        };


        this.documentoService.create(nuevoDocumento).subscribe({

          next: (documentoCreado) => {

            this.showMessage(`✓ Documento "${documentoCreado.nombre}" creado correctamente`);


            this.loadDocuments();
          },

          error: (error) => {

            if (!environment.production) {
              console.error('✗ Error al crear documento:', error);
            }

            this.showMessage('✗ Error al crear el documento. Por favor, intente nuevamente.');
          }
        });
      }
    });
  }


  viewDocument(document: Documento): void {

    if (document.rutaArchivo) {

      if (document.rutaArchivo.includes('base64')) {

        if (!environment.production) {
          console.error('❌ Error: La ruta del archivo contiene base64');
        }

        this.showMessage('✗ Error: El documento no tiene una URL válida');
        return;
      }




      const backendUrl = environment.apiUrl.replace('/api', '');
      const fileUrl = document.rutaArchivo.startsWith('http')
        ? document.rutaArchivo
        : `${backendUrl}${document.rutaArchivo}`;


      if (!environment.production) {
        console.log('📄 Abriendo documento:', {
          nombre: document.nombre,
          tipo: document.tipo,
          urlCompleta: fileUrl
        });
      }


      try {
        new URL(fileUrl);
      } catch (error) {

        if (!environment.production) {
          console.error('❌ URL inválida:', fileUrl);
        }

        this.showMessage('✗ Error: URL del documento inválida');
        return;
      }





      const pdfUrl = `${environment.apiUrl}/documentos/${document.documentoID}/pdf`;


      this.dialog.open(PdfViewerDialogComponent, {
        width: '95vw',
        maxWidth: '1600px',
        height: '90vh',
        panelClass: 'pdf-viewer-dialog-container',
        hasBackdrop: true,
        disableClose: false,
        autoFocus: false,
        restoreFocus: false,
        data: {
          documentoId: document.documentoID,
          fileName: document.nombre,
          pdfUrl: pdfUrl,
          originalFileUrl: fileUrl,
          fileType: document.tipo
        }
      });


      if (document.documentoID) {
        this.documentoService.incrementViews(document.documentoID).subscribe({
          next: () => {
            if (!environment.production) {
              console.log('✓ Vista registrada correctamente');
            }
            this.loadDocuments();
          },
          error: (error) => {
            if (!environment.production) {
              console.error('✗ Error al registrar vista:', error);
            }
          }
        });
      }

      return;








    } else {

      this.showMessage(`✗ El documento "${document.nombre}" no tiene URL asociada`);
    }
  }


  downloadDocument(doc: Documento): void {
    if (!doc.rutaArchivo) {
      this.showMessage(`✗ El documento "${doc.nombre}" no tiene URL asociada`);
      return;
    }

    if (doc.rutaArchivo.includes('base64')) {
      this.showMessage('✗ Error: El documento no tiene una URL válida');
      return;
    }

    const backendUrl = environment.apiUrl.replace('/api', '');
    const fileUrl = doc.rutaArchivo.startsWith('http')
      ? doc.rutaArchivo
      : `${backendUrl}${doc.rutaArchivo}`;

    if (!environment.production) {
      console.log('⬇️ Descargando documento:', {
        nombre: doc.nombre,
        tipo: doc.tipo,
        urlCompleta: fileUrl
      });
    }

    try {
      new URL(fileUrl);
    } catch (error) {
      this.showMessage('✗ Error: URL del documento inválida');
      return;
    }

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = doc.nombreArchivo || doc.nombre || 'documento';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showMessage(`⬇️ Descargando: ${doc.nombre}`);

    if (doc.documentoID) {
      this.documentoService.incrementDownloads(doc.documentoID).subscribe({
        next: () => {
          if (!environment.production) {
            console.log('✓ Descarga registrada correctamente');
          }
          this.loadDocuments();
        },
        error: (error) => {
          if (!environment.production) {
            console.error('✗ Error al registrar descarga:', error);
          }
        }
      });
    }
  }


  printDocument(doc: Documento): void {

    if (doc.rutaArchivo) {

      const pdfUrl = `${environment.apiUrl}/documentos/${doc.documentoID}/pdf`;


      if (!environment.production) {
        console.log('🖨️ Imprimiendo documento:', {
          nombre: doc.nombre,
          tipo: doc.tipo,
          pdfUrl: pdfUrl
        });
      }


      this.showMessage(`🖨️ Preparando impresión: ${doc.nombre}`);


      fetch(pdfUrl)
        .then(response => response.blob())
        .then(blob => {

          const blobUrl = URL.createObjectURL(blob);


          const printIframe = document.createElement('iframe');
          printIframe.style.position = 'fixed';
          printIframe.style.right = '0';
          printIframe.style.bottom = '0';
          printIframe.style.width = '0';
          printIframe.style.height = '0';
          printIframe.style.border = 'none';
          printIframe.style.visibility = 'hidden';

          document.body.appendChild(printIframe);


          printIframe.src = blobUrl;


          printIframe.onload = () => {
            setTimeout(() => {
              try {
                printIframe.contentWindow?.focus();
                printIframe.contentWindow?.print();


                setTimeout(() => {
                  if (document.body.contains(printIframe)) {
                    document.body.removeChild(printIframe);
                  }
                  URL.revokeObjectURL(blobUrl);
                }, 30000);
              } catch (error) {
                console.error('Error al imprimir:', error);
                if (document.body.contains(printIframe)) {
                  document.body.removeChild(printIframe);
                }
                URL.revokeObjectURL(blobUrl);
                this.showMessage('✗ Error al imprimir');
              }
            }, 500);
          };
        })
        .catch(error => {
          console.error('Error al descargar PDF para imprimir:', error);
          this.showMessage('✗ Error al preparar el documento para imprimir');
        });
    } else {
      this.showMessage(`✗ El documento "${doc.nombre}" no está disponible para imprimir`);
    }
  }


  editDocument(document: Documento): void {

    const dialogRef = this.dialog.open(CreateDocumentoDialogComponent, {
      width: '600px',
      disableClose: false,
      data: document
    });


    dialogRef.afterClosed().subscribe(result => {
      if (result) {

        const datosActualizados: Partial<Documento> = {
          nombre: result.name,
          tipo: result.type,
          categoria: result.category,
          estado: result.status,
          descripcion: result.description,
          rutaArchivo: result.url
        };


        this.documentoService.update(document.documentoID!, datosActualizados).subscribe({

          next: (documentoActualizado) => {

            this.showMessage(`✓ Documento "${documentoActualizado.nombre}" actualizado correctamente`);


            this.loadDocuments();
          },

          error: (error) => {

            if (!environment.production) {
              console.error('✗ Error al actualizar documento:', error);
            }

            this.showMessage('✗ Error al actualizar el documento. Por favor, intente nuevamente.');
          }
        });
      }
    });
  }


  deleteDocument(document: Documento): void {

    if (!document.documentoID) {

      this.showMessage('Error: Documento sin ID');
      return;
    }


    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      disableClose: false,
      data: {
        title: 'Confirmar Eliminación',
        message: `¿Está seguro de que desea eliminar el documento "${document.nombre}"? Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        type: 'danger'
      }
    });


    dialogRef.afterClosed().subscribe(confirmed => {

      if (confirmed) {

        this.documentoService.delete(document.documentoID!).subscribe({

          next: () => {

            this.showMessage(`✓ Documento "${document.nombre}" eliminado correctamente`);


            this.loadDocuments();
          },

          error: (error) => {

            console.error('Error al eliminar documento:', error);

            this.showMessage('✗ Error al eliminar el documento');
          }
        });
      }


    });
  }




  getTypeIcon(type: string): string {

    const icons: { [key: string]: string } = {
      'PDF': 'picture_as_pdf',
      'Word': 'description',
      'Excel': 'table_chart',
      'Image': 'image',
      'Video': 'videocam'
    };

    return icons[type] || 'insert_drive_file';
  }


  getStatusIcon(status: string): string {

    const icons: { [key: string]: string } = {
      'active': 'check_circle',
      'draft': 'edit',
      'archived': 'archive'
    };

    return icons[status] || 'help';
  }


  getCategoryLabel(category: string): string {

    const cat = this.categories.find(c => c.value === category);

    return cat ? cat.label : category;
  }


  private getFileType(filename: string): string {

    const extension = filename.split('.').pop()?.toLowerCase();

    const types: { [key: string]: string } = {
      'pdf': 'PDF',
      'doc': 'Word',
      'docx': 'Word',
      'xls': 'Excel',
      'xlsx': 'Excel',
      'png': 'Image',
      'jpg': 'Image',
      'jpeg': 'Image'
    };

    return types[extension || ''] || 'Archivo';
  }


  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }




  private showMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
