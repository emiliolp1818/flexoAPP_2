import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { HeaderComponent } from '../header/header';

interface PedidoInfo {
  otSap: string;
  articulo: string;
  cliente: string;
  referencia: string;
  td: string;
  numeroColores: number;
  colores: string[];
  kilos: number;
  fechaTintaEnMaquina: Date;
  sustrato: string;
  estado: string;
  numeroMaquina: number;
  observaciones?: string;
  lastActionBy?: string;
  lastActionAt?: Date;
  // Historial de estados
  historialEstados?: Array<{
    estado: string;
    timestamp: Date;
    userCode: string;
    userName: string;
    observaciones?: string;
  }>;
}

@Component({
  selector: 'app-consulta-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatExpansionModule,
    FormsModule,
    HeaderComponent
  ],
  templateUrl: './consulta-pedidos.html',
  styleUrls: ['./consulta-pedidos.scss']
})
export class ConsultaPedidosComponent implements OnInit {
  // Señales reactivas
  loading = signal(false);
  searchTerm = signal('');
  pedidoInfo = signal<PedidoInfo | null>(null);
  errorMessage = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    console.log('🔍 Módulo de Consulta de Pedidos inicializado');
  }

  // Buscar pedido por OT SAP o Artículo
  async buscarPedido() {
    const term = this.searchTerm().trim();
    
    if (!term) {
      this.snackBar.open('Por favor ingresa un OT SAP o Artículo', 'Cerrar', { duration: 3000 });
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    this.pedidoInfo.set(null);

    try {
      console.log('🔍 Buscando pedido:', term);

      // Buscar en la tabla de máquinas
      const response: any = await this.http.get(`${environment.apiUrl}/maquinas`).toPromise();

      if (response && response.success && response.data) {
        // Buscar por OT SAP o Artículo
        const pedido = response.data.find((p: any) => 
          String(p.otSap).toLowerCase().includes(term.toLowerCase()) ||
          String(p.articulo).toLowerCase().includes(term.toLowerCase())
        );

        if (pedido) {
          // Parsear colores
          let colores: string[] = [];
          if (pedido.colores) {
            try {
              colores = typeof pedido.colores === 'string' 
                ? JSON.parse(pedido.colores) 
                : pedido.colores;
            } catch (e) {
              console.warn('Error parseando colores:', e);
            }
          }

          // Obtener historial de estados desde auditoría
          const historial = await this.obtenerHistorialEstados(pedido.otSap, pedido.articulo);

          this.pedidoInfo.set({
            otSap: pedido.otSap,
            articulo: pedido.articulo,
            cliente: pedido.cliente,
            referencia: pedido.referencia,
            td: pedido.td,
            numeroColores: colores.length,
            colores: colores,
            kilos: pedido.kilos,
            fechaTintaEnMaquina: new Date(pedido.fechaTintaEnMaquina),
            sustrato: pedido.sustrato,
            estado: pedido.estado,
            numeroMaquina: pedido.numeroMaquina,
            observaciones: pedido.observaciones,
            lastActionBy: pedido.updatedByUser?.firstName && pedido.updatedByUser?.lastName 
              ? `${pedido.updatedByUser.firstName} ${pedido.updatedByUser.lastName}`.trim()
              : pedido.lastActionBy || 'Sistema',
            lastActionAt: pedido.updatedAt ? new Date(pedido.updatedAt) : undefined,
            historialEstados: historial
          });

          this.snackBar.open('Pedido encontrado', 'Cerrar', { duration: 2000 });
        } else {
          this.errorMessage.set('No se encontró ningún pedido con ese OT SAP o Artículo');
          this.snackBar.open('Pedido no encontrado', 'Cerrar', { duration: 3000 });
        }
      } else {
        this.errorMessage.set('Error al consultar los pedidos');
      }
    } catch (error: any) {
      console.error('❌ Error buscando pedido:', error);
      this.errorMessage.set('Error al buscar el pedido. Por favor intenta nuevamente.');
      this.snackBar.open('Error al buscar pedido', 'Cerrar', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }

  // Obtener historial de estados desde auditoría
  async obtenerHistorialEstados(otSap: string, articulo: string): Promise<Array<{
    estado: string;
    timestamp: Date;
    userCode: string;
    userName: string;
    observaciones?: string;
  }>> {
    try {
      const response: any = await this.http.get(`${environment.apiUrl}/audit/activities`, {
        params: {
          page: 1,
          pageSize: 1000
        }
      }).toPromise();

      if (response && response.activities) {
        // Filtrar actividades de máquinas para este pedido
        const actividadesPedido = response.activities.filter((a: any) => {
          if (a.module !== 'MACHINES') return false;

          // Verificar si es el pedido correcto
          let esElPedido = false;
          
          if (a.details) {
            try {
              const details = JSON.parse(a.details);
              esElPedido = details.otSap === otSap || details.articulo === articulo;
            } catch (e) {}
          }

          if (!esElPedido && a.newValues) {
            try {
              const newVals = JSON.parse(a.newValues);
              esElPedido = newVals.otSap === otSap || newVals.articulo === articulo;
            } catch (e) {}
          }

          return esElPedido;
        });

        // Mapear a historial de estados
        const historial = actividadesPedido.map((a: any) => {
          let estado = '-';
          let observaciones = '';

          if (a.newValues) {
            try {
              const newVals = JSON.parse(a.newValues);
              estado = newVals.estado || newVals.Estado || '-';
              observaciones = newVals.observaciones || newVals.Observaciones || '';
            } catch (e) {}
          }

          return {
            estado: estado,
            timestamp: new Date(a.timestamp),
            userCode: a.user?.userCode || a.userCode || '-',
            userName: a.user?.fullName || `${a.user?.firstName || ''} ${a.user?.lastName || ''}`.trim() || '-',
            observaciones: observaciones
          };
        });

        // Ordenar por fecha (más reciente primero)
        historial.sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime());

        return historial;
      }

      return [];
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      return [];
    }
  }

  // Limpiar búsqueda
  limpiarBusqueda() {
    this.searchTerm.set('');
    this.pedidoInfo.set(null);
    this.errorMessage.set(null);
  }

  // Obtener color del estado
  getEstadoColor(estado: string): string {
    const colores: any = {
      'SIN_ASIGNAR': '#64748b',
      'PREPARANDO': '#eab308',
      'LISTO': '#16a34a',
      'CORRIENDO': '#2196f3',
      'SUSPENDIDO': '#f97316',
      'TERMINADO': '#dc2626'
    };
    return colores[estado] || '#64748b';
  }

  // Obtener etiqueta del estado
  getEstadoLabel(estado: string): string {
    const etiquetas: any = {
      'SIN_ASIGNAR': 'Sin Asignar',
      'PREPARANDO': 'Preparando',
      'LISTO': 'Listo',
      'CORRIENDO': 'Corriendo',
      'SUSPENDIDO': 'Suspendido',
      'TERMINADO': 'Terminado'
    };
    return etiquetas[estado] || estado;
  }
}
