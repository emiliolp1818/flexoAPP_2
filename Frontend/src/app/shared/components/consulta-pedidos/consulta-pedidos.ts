import { Component, OnInit, signal, computed } from '@angular/core';
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

interface PedidoAgrupado {
  articulo: string;
  colores: string[];
  coloresStr: string;
  kilosTotales: number;
  otsSap: string[];
  maquinas: number[];
  cantidadOTs: number;
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
    FormsModule
  ],
  templateUrl: './consulta-pedidos.html',
  styleUrls: ['./consulta-pedidos.scss']
})
export class ConsultaPedidosComponent implements OnInit {
  // Señales reactivas
  loading = signal(false);
  searchTermOT = signal('');
  searchTermArticulo = signal('');
  pedidosAgrupados = signal<PedidoAgrupado[]>([]);
  allPedidos = signal<any[]>([]);

  // Columnas de la tabla
  displayedColumns: string[] = ['articulo', 'colores', 'kilosTotales', 'cantidadOTs', 'otsSap', 'maquinas'];

  // Computed para filtrar pedidos
  filteredPedidos = computed(() => {
    const pedidos = this.pedidosAgrupados();
    const otTerm = this.searchTermOT().toLowerCase().trim();
    const articuloTerm = this.searchTermArticulo().toLowerCase().trim();

    if (!otTerm && !articuloTerm) {
      return pedidos;
    }

    return pedidos.filter(p => {
      const matchOT = !otTerm || p.otsSap.some(ot => ot.toLowerCase().includes(otTerm));
      const matchArticulo = !articuloTerm || p.articulo.toLowerCase().includes(articuloTerm);
      return matchOT && matchArticulo;
    });
  });

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    console.log('🔍 Módulo de Consulta de Pedidos inicializado');
    this.cargarPedidos();
  }

  // Cargar todos los pedidos y agruparlos
  async cargarPedidos() {
    this.loading.set(true);

    try {
      const response: any = await this.http.get(`${environment.apiUrl}/maquinas`).toPromise();

      if (response && response.success && response.data) {
        this.allPedidos.set(response.data);
        this.agruparPedidos(response.data);
        this.snackBar.open('Pedidos cargados correctamente', 'Cerrar', { duration: 2000 });
      }
    } catch (error: any) {
      console.error('❌ Error cargando pedidos:', error);
      this.snackBar.open('Error al cargar pedidos', 'Cerrar', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }

  // Agrupar pedidos por artículo y colores
  agruparPedidos(pedidos: any[]) {
    const grupos = new Map<string, PedidoAgrupado>();

    pedidos.forEach(pedido => {
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

      // Crear clave única: artículo + colores ordenados
      const coloresOrdenados = [...colores].sort();
      const clave = `${pedido.articulo}|${coloresOrdenados.join(',')}`;

      if (grupos.has(clave)) {
        // Agregar a grupo existente
        const grupo = grupos.get(clave)!;
        grupo.kilosTotales += pedido.kilos || 0;
        grupo.otsSap.push(pedido.otSap);
        if (pedido.numeroMaquina && !grupo.maquinas.includes(pedido.numeroMaquina)) {
          grupo.maquinas.push(pedido.numeroMaquina);
        }
        grupo.cantidadOTs++;
      } else {
        // Crear nuevo grupo
        grupos.set(clave, {
          articulo: pedido.articulo,
          colores: coloresOrdenados,
          coloresStr: coloresOrdenados.join(', '),
          kilosTotales: pedido.kilos || 0,
          otsSap: [pedido.otSap],
          maquinas: pedido.numeroMaquina ? [pedido.numeroMaquina] : [],
          cantidadOTs: 1
        });
      }
    });

    // Convertir a array y ordenar por artículo
    const agrupados = Array.from(grupos.values()).sort((a, b) => 
      a.articulo.localeCompare(b.articulo)
    );

    this.pedidosAgrupados.set(agrupados);
  }

  // Limpiar búsqueda
  limpiarBusqueda() {
    this.searchTermOT.set('');
    this.searchTermArticulo.set('');
  }

  // Refrescar datos
  refreshPedidos() {
    this.cargarPedidos();
  }
}
