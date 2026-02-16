

import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';



import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';



export interface DuplicateDesignDialogData {
  originalArticleF: string;
  suggestedArticleF: string;
}



@Component({
  selector: 'app-duplicate-design-dialog',
  standalone: true,
  imports: [

    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],


  template: `
    <!-- Contenedor principal del diálogo con clase para estilos -->
    <div class="duplicate-dialog">

      <!-- ===== HEADER DEL DIÁLOGO ===== -->
      <!-- Barra superior con gradiente morado, título y botón de cerrar -->
      <div class="dialog-header">
        <!-- Sección izquierda: icono circular + título -->
        <div class="header-left">
          <!-- Círculo con icono de duplicar -->
          <div class="icon-circle">
            <mat-icon>content_copy</mat-icon>
          </div>
          <!-- Título del diálogo -->
          <span class="title">Duplicar</span>
        </div>
        <!-- Botón de cerrar -->
        <button mat-icon-button mat-dialog-close class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- ===== CONTENIDO PRINCIPAL DEL DIÁLOGO ===== -->
      <!-- Área central con el flujo visual de duplicación -->
      <div class="dialog-content">

        <!-- ===== BADGE DEL DISEÑO ORIGINAL ===== -->
        <div class="original-badge">
          <mat-icon>article</mat-icon>
          <span>{{ data.originalArticleF }}</span>
        </div>

        <!-- ===== FLECHA ANIMADA ===== -->
        <div class="arrow-down">
          <mat-icon>arrow_downward</mat-icon>
        </div>

        <!-- ===== CAMPO DE ENTRADA PARA NUEVO CÓDIGO ===== -->
        <!-- Input donde el usuario ingresa el código del nuevo diseño -->
        <mat-form-field appearance="outline" class="compact-field">
          <mat-label>Nuevo código</mat-label>
          <input
            matInput
            [(ngModel)]="newArticleF"
            (keyup.enter)="onConfirm()"
            autofocus>
          <mat-icon matSuffix color="primary">edit</mat-icon>
        </mat-form-field>

        <!-- ===== MENSAJE DE ADVERTENCIA ===== -->
        <!-- Solo se muestra si el nuevo código es igual al original -->
        <div class="warning-inline" *ngIf="newArticleF && newArticleF.trim() === data.originalArticleF">
          <mat-icon>error_outline</mat-icon>
          <span>Debe ser diferente</span>
        </div>
      </div>

      <!-- ===== FOOTER CON BOTONES DE ACCIÓN ===== -->
      <!-- Barra inferior con botones de Cancelar y Duplicar -->
      <div class="dialog-actions">
        <!-- Botón Cancelar -->
        <button mat-button mat-dialog-close class="btn-cancel">
          Cancelar
        </button>
        <!-- Botón Duplicar -->
        <button
          mat-raised-button
          color="primary"
          (click)="onConfirm()"
          [disabled]="!newArticleF || newArticleF.trim() === '' || newArticleF.trim() === data.originalArticleF"
          class="btn-confirm">
          <mat-icon>check</mat-icon>
          Duplicar
        </button>
      </div>
    </div>
  `,


  styles: [`
    /* ===== CONTENEDOR PRINCIPAL DEL DIÁLOGO ===== */
    /* Define el tamaño y comportamiento del diálogo modal */
    .duplicate-dialog {
      width: 360px; /* Ancho fijo del diálogo (compacto) */
      max-width: 95vw; /* Máximo 95% del ancho de la ventana (responsive) */
    }

    /* ===== HEADER DEL DIÁLOGO ===== */
    /* Barra superior con gradiente morado y contenido centrado */
    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
      color: white;
      border-radius: 20px 20px 0 0;
    }

    /* ===== SECCIÓN IZQUIERDA DEL HEADER ===== */
    /* Contiene el icono circular y el título */
    .header-left {
      display: flex; /* Flexbox para layout horizontal */
      align-items: center; /* Centrado vertical */
      gap: 10px; /* Espaciado de 10px entre icono y título */
    }

    /* ===== CÍRCULO CON ICONO ===== */
    /* Contenedor circular para el icono de duplicar */
    .icon-circle {
      display: flex; /* Flexbox para centrar el icono */
      align-items: center; /* Centrado vertical del icono */
      justify-content: center; /* Centrado horizontal del icono */
      width: 32px; /* Ancho del círculo */
      height: 32px; /* Alto del círculo (igual al ancho = círculo perfecto) */
      background: rgba(255, 255, 255, 0.2); /* Fondo blanco semi-transparente (20% opacidad) */
      border-radius: 50%; /* Bordes redondeados al 50% = círculo perfecto */
    }

    /* ===== ICONO DENTRO DEL CÍRCULO ===== */
    /* Tamaño del icono de Material Design */
    .icon-circle mat-icon {
      font-size: 18px; /* Tamaño de fuente del icono */
      width: 18px; /* Ancho del icono */
      height: 18px; /* Alto del icono */
    }

    /* ===== TÍTULO DEL HEADER ===== */
    /* Texto "Duplicar" en el header */
    .title {
      font-size: 1rem; /* Tamaño de fuente: 16px (1rem = 16px por defecto) */
      font-weight: 600; /* Peso de fuente semi-bold */
    }

    /* ===== BOTÓN DE CERRAR ===== */
    /* Botón X en la esquina superior derecha */
    .close-btn {
      color: white; /* Color blanco del icono */
      width: 32px; /* Ancho del botón */
      height: 32px; /* Alto del botón */
    }

    /* ===== ICONO DEL BOTÓN DE CERRAR ===== */
    /* Tamaño del icono X */
    .close-btn mat-icon {
      font-size: 18px; /* Tamaño de fuente del icono */
      width: 18px; /* Ancho del icono */
      height: 18px; /* Alto del icono */
    }

    /* ===== ESTADO HOVER DEL BOTÓN DE CERRAR ===== */
    /* Efecto visual al pasar el mouse sobre el botón */
    .close-btn:hover {
      background: rgba(255, 255, 255, 0.15); /* Fondo blanco semi-transparente (15% opacidad) */
    }

    /* ===== CONTENIDO PRINCIPAL DEL DIÁLOGO ===== */
    /* Área central con el flujo visual de duplicación */
    .dialog-content {
      padding: 16px 24px;
      display: flex; /* Flexbox para layout vertical */
      flex-direction: column; /* Dirección vertical: elementos apilados */
      align-items: center; /* Centrado horizontal de todos los elementos */
      gap: 16px;
    }

    /* ===== BADGE DEL DISEÑO ORIGINAL ===== */
    /* Tarjeta que muestra el código del diseño a duplicar */
    .original-badge {
      display: flex; /* Flexbox para layout horizontal */
      align-items: center; /* Centrado vertical del contenido */
      gap: 8px; /* Espaciado de 8px entre icono y texto */
      padding: 10px 16px; /* Padding interno: 10px arriba/abajo, 16px izq/der */
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); /* Gradiente gris claro */
      border: 2px solid #cbd5e1; /* Borde sólido gris de 2px */
      border-radius: 12px; /* Bordes redondeados de 12px */
      width: 100%; /* Ancho completo del contenedor padre */
      box-sizing: border-box; /* Incluir padding y border en el ancho total */
    }

    /* ===== ICONO DEL BADGE ORIGINAL ===== */
    /* Icono de artículo/documento en el badge */
    .original-badge mat-icon {
      color: #64748b; /* Color gris medio */
      font-size: 20px; /* Tamaño de fuente del icono */
      width: 20px; /* Ancho del icono */
      height: 20px; /* Alto del icono */
    }

    /* ===== TEXTO DEL BADGE ORIGINAL ===== */
    /* Código del diseño original (ej: F204567) */
    .original-badge span {
      flex: 1; /* Ocupar todo el espacio disponible */
      font-size: 0.9rem; /* Tamaño de fuente: 14.4px (0.9 * 16px) */
      font-weight: 600; /* Peso de fuente semi-bold */
      color: #334155; /* Color gris oscuro */
      font-family: 'SF Mono', 'Monaco', monospace; /* Fuente monoespaciada para códigos */
    }

    /* ===== FLECHA ANIMADA ===== */
    /* Círculo morado con flecha que indica la dirección de la copia */
    .arrow-down {
      display: flex; /* Flexbox para centrar el icono */
      align-items: center; /* Centrado vertical */
      justify-content: center; /* Centrado horizontal */
      width: 32px; /* Ancho del círculo */
      height: 32px; /* Alto del círculo */
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); /* Gradiente morado */
      border-radius: 50%; /* Círculo perfecto */
      box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3); /* Sombra morada suave */
    }

    /* ===== ICONO DE LA FLECHA ===== */
    /* Flecha hacia abajo con animación bounce */
    .arrow-down mat-icon {
      color: white; /* Color blanco del icono */
      font-size: 20px; /* Tamaño de fuente del icono */
      width: 20px; /* Ancho del icono */
      height: 20px; /* Alto del icono */
      animation: bounce 1.5s ease-in-out infinite; /* Animación bounce infinita de 1.5s */
    }

    /* ===== ANIMACIÓN BOUNCE ===== */
    /* Animación de rebote para la flecha (sube y baja) */
    @keyframes bounce {
      0%, 100% { transform: translateY(0); } /* Inicio y fin: posición original */
      50% { transform: translateY(4px); } /* Mitad: desplazar 4px hacia abajo */
    }

    /* ===== CAMPO DE ENTRADA COMPACTO ===== */
    /* Input para el nuevo código del diseño */
    .compact-field {
      width: 100%; /* Ancho completo del contenedor */
      margin: 0; /* Sin márgenes externos */
    }

    /* ===== MENSAJE DE ADVERTENCIA INLINE ===== */
    /* Alerta roja que aparece si el código es igual al original */
    .warning-inline {
      display: flex; /* Flexbox para layout horizontal */
      align-items: center; /* Centrado vertical del contenido */
      gap: 6px; /* Espaciado de 6px entre icono y texto */
      padding: 6px 12px; /* Padding interno: 6px arriba/abajo, 12px izq/der */
      background: #fef2f2; /* Fondo rojo muy claro */
      border-radius: 8px; /* Bordes redondeados de 8px */
      border: 1px solid #fca5a5; /* Borde rojo claro de 1px */
      width: 100%; /* Ancho completo del contenedor */
      box-sizing: border-box; /* Incluir padding y border en el ancho total */
    }

    /* ===== ICONO DE ADVERTENCIA ===== */
    /* Icono de error/advertencia en el mensaje */
    .warning-inline mat-icon {
      color: #dc2626; /* Color rojo intenso */
      font-size: 16px; /* Tamaño de fuente del icono */
      width: 16px; /* Ancho del icono */
      height: 16px; /* Alto del icono */
    }

    /* ===== TEXTO DE ADVERTENCIA ===== */
    /* Mensaje "Debe ser diferente" */
    .warning-inline span {
      font-size: 0.8rem; /* Tamaño de fuente: 12.8px (0.8 * 16px) */
      color: #991b1b; /* Color rojo oscuro */
      font-weight: 600; /* Peso de fuente semi-bold */
    }

    /* ===== FOOTER CON BOTONES DE ACCIÓN ===== */
    /* Barra inferior con botones de Cancelar y Duplicar */
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
      border-radius: 0 0 20px 20px;
    }

    /* ===== BOTÓN CANCELAR ===== */
    /* Botón de texto simple para cancelar la acción */
    .btn-cancel {
      color: #64748b; /* Color gris medio */
      font-size: 0.9rem; /* Tamaño de fuente: 14.4px */
    }

    /* ===== ESTADO HOVER DEL BOTÓN CANCELAR ===== */
    /* Efecto visual al pasar el mouse */
    .btn-cancel:hover {
      background: #f1f5f9; /* Fondo gris muy claro */
    }

    /* ===== BOTÓN CONFIRMAR/DUPLICAR ===== */
    /* Botón principal con gradiente morado */
    .btn-confirm {
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); /* Gradiente morado */
      color: white; /* Texto blanco */
      font-size: 0.9rem; /* Tamaño de fuente: 14.4px */
      box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3); /* Sombra morada suave */
    }

    /* ===== ICONO DEL BOTÓN CONFIRMAR ===== */
    /* Icono de check/confirmar */
    .btn-confirm mat-icon {
      font-size: 16px; /* Tamaño de fuente del icono */
      width: 16px; /* Ancho del icono */
      height: 16px; /* Alto del icono */
      margin-right: 4px; /* Margen derecho de 4px para separar del texto */
    }

    /* ===== ESTADO HOVER DEL BOTÓN CONFIRMAR ===== */
    /* Efecto visual al pasar el mouse (solo si no está deshabilitado) */
    .btn-confirm:hover:not(:disabled) {
      background: linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%); /* Gradiente morado más oscuro */
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.4); /* Sombra más pronunciada */
      transform: translateY(-1px); /* Elevar el botón 1px hacia arriba */
    }

    /* ===== ESTADO DESHABILITADO DEL BOTÓN CONFIRMAR ===== */
    /* Estilo cuando el botón está deshabilitado (código inválido) */
    .btn-confirm:disabled {
      opacity: 0.5; /* Opacidad reducida al 50% */
      cursor: not-allowed; /* Cursor de "no permitido" */
    }
  `]
})


export class DuplicateDesignDialogComponent {


  newArticleF: string;



  constructor(

    public dialogRef: MatDialogRef<DuplicateDesignDialogComponent>,

    @Inject(MAT_DIALOG_DATA) public data: DuplicateDesignDialogData
  ) {

    this.newArticleF = data.suggestedArticleF;
  }



  onConfirm(): void {

    if (this.newArticleF &&
      this.newArticleF.trim() !== '' &&
      this.newArticleF.trim() !== this.data.originalArticleF) {

      this.dialogRef.close(this.newArticleF.trim());
    }

  }
}
