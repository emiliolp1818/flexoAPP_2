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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatRippleModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { MaquinasBackupService, MaquinaBackup } from '../../services/maquinas-backup.service';
import { PantoneLiveService } from '../../services/pantone-live.service';

interface PedidoAgrupado {
  articulo: string;
  colores: string[];
  coloresStr: string;
  kilosTotales: number;
  otsSap: string[];
  maquinas: number[];
  cantidadOTs: number;

  backupDate?: Date;
  backupReason?: string;
  backupUserName?: string;
  lastActionBy?: string;
  lastActionAt?: Date;
  estado?: string;
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
    MatTooltipModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatRippleModule,
    FormsModule
  ],
  templateUrl: './consulta-pedidos.html',
  styleUrls: ['./consulta-pedidos.scss']
})
export class ConsultaPedidosComponent implements OnInit {

  loading = signal(false);
  searchTermOT = signal('');
  searchTermArticulo = signal('');
  pedidosAgrupados = signal<PedidoAgrupado[]>([]);
  allPedidos = signal<any[]>([]);


  pageSize = signal(25);
  pageIndex = signal(0);


  displayedColumns: string[] = ['articulo', 'colores', 'kilosTotales', 'cantidadOTs', 'otsSap', 'maquinas', 'estado', 'backupInfo'];


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


  paginatedPedidos = computed(() => {
    const filtered = this.filteredPedidos();
    const startIndex = this.pageIndex() * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return filtered.slice(startIndex, endIndex);
  });

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private backupService: MaquinasBackupService,
    private pantoneService: PantoneLiveService
  ) { }

  ngOnInit() {
    console.log('🔍 Módulo de Consulta de Pedidos inicializado');
    this.cargarPedidos();
  }


  async cargarPedidos() {
    this.loading.set(true);

    try {

      const [pedidosActuales, pedidosHistorico] = await Promise.all([
        this.cargarPedidosActuales(),
        this.cargarPedidosHistorico()
      ]);


      const todosPedidos = [...pedidosActuales, ...pedidosHistorico];
      this.allPedidos.set(todosPedidos);
      this.agruparPedidosCombinados(todosPedidos);

      this.snackBar.open(`${todosPedidos.length} pedidos cargados (actuales + histórico)`, 'Cerrar', { duration: 2000 });
    } catch (error) {
      console.error('❌ Error cargando pedidos:', error);
      this.snackBar.open('Error al cargar pedidos', 'Cerrar', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }


  async cargarPedidosActuales(): Promise<any[]> {
    try {
      const response: any = await this.http.get(`${environment.apiUrl}/maquinas`).toPromise() || { success: false };
      if (response && response.success && response.data) {
        return response.data.map((p: any) => ({ ...p, esHistorico: false }));
      }
      return [];
    } catch (error) {
      console.error('❌ Error cargando pedidos actuales:', error);
      return [];
    }
  }


  async cargarPedidosHistorico(): Promise<any[]> {
    try {
      const filters: any = {
        page: 1,
        pageSize: 10000
      };

      if (this.searchTermArticulo()) filters.articulo = this.searchTermArticulo();
      if (this.searchTermOT()) filters.otSap = this.searchTermOT();

      const response: any = await this.backupService.searchBackup(filters).toPromise() || { data: [] };
      if (response && response.data) {
        return response.data.map((p: any) => ({ ...p, esHistorico: true }));
      }
      return [];
    } catch (error) {
      console.error('❌ Error cargando pedidos históricos:', error);
      return [];
    }
  }


  agruparPedidosCombinados(pedidos: any[]) {
    const grupos = new Map<string, PedidoAgrupado>();

    pedidos.forEach(pedido => {
      const colores = this.parseColores(pedido.colores);
      const coloresOrdenados = [...colores].sort();
      const clave = `${pedido.articulo}|${coloresOrdenados.join(',')}`;

      if (grupos.has(clave)) {
        const grupo = grupos.get(clave)!;
        grupo.kilosTotales += pedido.kilos || 0;
        if (!grupo.otsSap.includes(pedido.otSap)) {
          grupo.otsSap.push(pedido.otSap);
        }
        if (pedido.numeroMaquina && !grupo.maquinas.includes(pedido.numeroMaquina)) {
          grupo.maquinas.push(pedido.numeroMaquina);
        }
        grupo.cantidadOTs = grupo.otsSap.length;
      } else {
        grupos.set(clave, {
          articulo: pedido.articulo,
          colores: coloresOrdenados,
          coloresStr: coloresOrdenados.join(', '),
          kilosTotales: pedido.kilos || 0,
          otsSap: [pedido.otSap],
          maquinas: pedido.numeroMaquina ? [pedido.numeroMaquina] : [],
          cantidadOTs: 1,
          backupDate: pedido.backupDate,
          backupReason: pedido.backupReason,
          backupUserName: pedido.backupUserName,
          lastActionBy: pedido.lastActionBy,
          lastActionAt: pedido.lastActionAt,
          estado: pedido.estado
        });
      }
    });

    const agrupados = Array.from(grupos.values()).sort((a, b) =>
      a.articulo.localeCompare(b.articulo)
    );

    this.pedidosAgrupados.set(agrupados);
  }


  parseColores(coloresData: any): string[] {
    if (!coloresData) return [];

    try {
      if (typeof coloresData === 'string') {
        return JSON.parse(coloresData);
      } else if (Array.isArray(coloresData)) {
        return coloresData;
      }
    } catch (e) {
      console.warn('Error parseando colores:', e);
    }

    return [];
  }


  limpiarBusqueda() {
    this.searchTermOT.set('');
    this.searchTermArticulo.set('');
  }


  refreshPedidos() {
    this.cargarPedidos();
  }


  previousPage() {
    if (this.pageIndex() > 0) {
      this.pageIndex.set(this.pageIndex() - 1);
    }
  }

  nextPage() {
    if (this.hasMorePages()) {
      this.pageIndex.set(this.pageIndex() + 1);
    }
  }

  hasMorePages(): boolean {
    const totalPages = Math.ceil(this.filteredPedidos().length / this.pageSize());
    return this.pageIndex() < totalPages - 1;
  }


  onPageSizeChange(newSize: number) {
    this.pageSize.set(newSize);
    this.pageIndex.set(0);
  }


  Math = Math;


  exportToExcel() {

    this.snackBar.open('Función de exportación en desarrollo', 'Cerrar', { duration: 2000 });
  }



  getPantoneInfo(colorName: string): { code: string; hex: string; displayName: string } {

    if (!colorName) {
      return {
        code: 'N/A',
        hex: '#CCCCCC',
        displayName: 'Sin color'
      };
    }


    let searchTerm = colorName;
    if (colorName.toUpperCase().startsWith('P_')) {
      searchTerm = colorName.substring(2);
    }


    const pantoneColors = this.pantoneService.searchColors(searchTerm);

    if (pantoneColors && pantoneColors.length > 0) {
      const pantoneColor = pantoneColors[0];
      return {
        code: pantoneColor.code,
        hex: pantoneColor.hex,
        displayName: pantoneColor.displayName
      };
    }


    const defaultHex = this.getDefaultColorHex(colorName);
    return {
      code: colorName,
      hex: defaultHex,
      displayName: colorName
    };
  }


  private getDefaultColorHex(colorName: string): string {
    const colorMap: { [key: string]: string } = {
      'CYAN': '#00FFFF',
      'MAGENTA': '#FF00FF',
      'AMARILLO': '#FFFF00',
      'YELLOW': '#FFFF00',
      'NEGRO': '#000000',
      'BLACK': '#000000',
      'BLANCO': '#FFFFFF',
      'WHITE': '#FFFFFF'
    };

    const upperColorName = colorName.toUpperCase();
    return colorMap[upperColorName] || '#CCCCCC';
  }


  getTextColor(hexColor: string): string {

    const hex = hexColor.replace('#', '');


    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);


    const brightness = (r * 299 + g * 587 + b * 114) / 1000;


    return brightness > 128 ? '#000000' : '#FFFFFF';
  }
}
