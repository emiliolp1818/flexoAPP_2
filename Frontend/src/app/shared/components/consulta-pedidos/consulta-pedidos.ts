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
import { MatSelectModule } from '@angular/material/select';
import { MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PantoneLiveService } from '../../services/pantone-live.service';
import * as ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Pedido {
  articulo: string;
  descripcion: string;
  otSap: string;
  colores: string[];
  kilos: number;
  metros: number;
  maquina: number;
  estado: string;
  lineaTinta?: string;
  fecha?: string;
  fechaDate?: Date | null;
}

interface PantoneMes {
  color: string;
  cantidad: number;
  kilos: number;
  metros: number;
  fecha: string;
  estado: string;
  lineaTinta: string;
  coloresCompletos: string[];
  articulos: string[];
  ots: string[];
  maquinas: number[];
  meses: string[];
}

@Component({
  selector: 'app-consulta-pedidos',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatButtonModule, MatIconModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatTableModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatTooltipModule, MatSelectModule, MatRippleModule,
    MatDatepickerModule, MatNativeDateModule, FormsModule
  ],
  templateUrl: './consulta-pedidos.html',
  styleUrls: ['./consulta-pedidos.scss']
})
export class ConsultaPedidosComponent implements OnInit {
  loading = signal(false);
  searchTerm = signal('');
  lineaTintaFilter = signal<string | null>(null);
  mesFilter = signal<number | null>(null); // null = últimos 3 meses, 1-12 = mes específico
  fechaDesde = signal<Date | null>(null);
  fechaHasta = signal<Date | null>(null);
  pantonesMes = signal<PantoneMes[]>([]);
  totalPedidos = signal(0);
  totalPantonesUnicos = signal(0);
  expandedPantones = signal<Set<string>>(new Set());
  pedidosByPantone = signal<Map<string, Pedido[]>>(new Map());
  rangoMeses = signal('');
  lineasTintaDisponibles = signal<string[]>([]);

  // Cache de líneas de tinta
  private lineaTintaCache = new Map<string, string>();

  mesesDisponibles = signal<{ value: number | null; label: string; year?: number }[]>([{ value: null, label: 'Todos' }]);

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private pantoneService: PantoneLiveService
  ) {}

  filteredPantones = computed(() => {
    let pantones = this.pantonesMes();
    const search = this.searchTerm().toLowerCase().trim();
    if (search) {
      pantones = pantones.filter(p =>
        p.color.toLowerCase().includes(search) ||
        p.articulos.some(a => a.toLowerCase().includes(search)) ||
        p.ots.some(o => o.toLowerCase().includes(search))
      );
    }
    return pantones;
  });

  Math = Math;

  ngOnInit() {
    this.cargarMesesDisponibles();
    this.cargarLineasTinta();
    this.cargarDatos();
  }

  async cargarMesesDisponibles() {
    try {
      const response: any = await this.http.get(`${environment.apiUrl}/maquinasbackup/meses-disponibles`).toPromise();
      if (Array.isArray(response)) {
        const meses: { value: number | null; label: string; year?: number }[] = [{ value: null, label: 'Todos' }];
        response.forEach((m: any) => meses.push({ value: m.value, label: m.label, year: m.year }));
        this.mesesDisponibles.set(meses);
      }
    } catch (error) {
      console.error('Error cargando meses disponibles:', error);
    }
  }

  async cargarLineasTinta() {
    try {
      const lineas: any = await this.http.get(`${environment.apiUrl}/cod-tintas/lineas-tinta`).toPromise();
      if (Array.isArray(lineas)) {
        this.lineasTintaDisponibles.set(lineas.sort());
      }
    } catch (error) {
      console.error('Error cargando líneas de tinta:', error);
    }
  }

  async cargarDatos() {
    this.loading.set(true);
    try {
      let params = new HttpParams();
      if (this.mesFilter() !== null) {
        params = params.set('mes', this.mesFilter()!.toString());
      }
      if (this.fechaDesde()) {
        params = params.set('fechaDesde', this.fechaDesde()!.toISOString());
      }
      if (this.fechaHasta()) {
        params = params.set('fechaHasta', this.fechaHasta()!.toISOString());
      }
      if (this.lineaTintaFilter()) {
        params = params.set('lineaTinta', this.lineaTintaFilter()!);
      }

      const response: any = await this.http.get(`${environment.apiUrl}/maquinasbackup/pantones-mes`, { params }).toPromise();
      if (response?.pantones) {
        const pantones: PantoneMes[] = response.pantones.map((p: any) => ({
          color: p.color,
          cantidad: p.cantidad,
          kilos: p.kilos || 0,
          metros: p.metros || 0,
          fecha: p.fecha || '',
          estado: p.estado || '',
          lineaTinta: p.lineaTinta || '',
          coloresCompletos: p.coloresCompletos || [],
          articulos: p.articulos || [],
          ots: p.ots || [],
          maquinas: p.maquinas || [],
          meses: p.meses || []
        }));
        this.pantonesMes.set(pantones);
        this.totalPedidos.set(response.totalPedidosConAccion || 0);
        this.totalPantonesUnicos.set(response.totalPantonesUnicos || 0);

        // Generar rango de meses para mostrar
        if (response.desde && response.hasta) {
          const desde = new Date(response.desde);
          const hasta = new Date(response.hasta);
          const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
          this.rangoMeses.set(`${meses[desde.getMonth()]} ${desde.getFullYear()} — ${meses[hasta.getMonth()]} ${hasta.getFullYear()}`);
        }
      }
    } catch (error) {
      console.error('Error cargando pantones:', error);
      this.snackBar.open('Error cargando datos', 'OK', { duration: 3000 });
    } finally {
      this.loading.set(false);
    }
  }

  async togglePantone(pantone: PantoneMes) {
    const expanded = new Set(this.expandedPantones());
    if (expanded.has(pantone.color)) {
      expanded.delete(pantone.color);
    } else {
      expanded.add(pantone.color);
      // Cargar pedidos si no están en cache
      if (!this.pedidosByPantone().has(pantone.color)) {
        await this.cargarPedidosPantone(pantone);
      }
    }
    this.expandedPantones.set(expanded);
  }

  isPantoneExpanded(color: string): boolean {
    return this.expandedPantones().has(color);
  }

  private async cargarPedidosPantone(pantone: PantoneMes) {
    try {
      // Obtener pedidos del backup filtrados por los OTs de este pantone
      const response: any = await this.http.post(
        `${environment.apiUrl}/maquinasbackup/pedidos-by-pantone`,
        { color: pantone.color, ots: pantone.ots }
      ).toPromise();

      if (response?.data) {
        const pedidos: Pedido[] = response.data.map((p: any) => ({
          articulo: p.articulo || '',
          descripcion: p.referencia || p.descripcion || '',
          otSap: p.otSap || '',
          colores: this.parseColores(p.colores),
          kilos: p.kilos || 0,
          metros: p.metros || 0,
          maquina: p.numeroMaquina || 0,
          estado: p.estado || '',
          lineaTinta: p.lineaTinta || '',
          fecha: p.fecha || '',
          fechaDate: p.backupDate ? new Date(p.backupDate) : null
        }));

        // Cargar líneas de tinta en bulk
        const articulos = [...new Set(pedidos.map(p => p.articulo))];
        if (articulos.length > 0) {
          try {
            const lineas: any = await this.http.post(`${environment.apiUrl}/cod-tintas/lineas-tinta-bulk`, articulos).toPromise();
            if (lineas) {
              pedidos.forEach(p => { p.lineaTinta = lineas[p.articulo] || ''; });
            }
          } catch {}
        }

        const map = new Map(this.pedidosByPantone());
        map.set(pantone.color, pedidos);
        this.pedidosByPantone.set(map);
      }
    } catch (error) {
      console.error('Error cargando pedidos del pantone:', error);
    }
  }

  getPedidos(color: string): Pedido[] {
    const pedidos = this.pedidosByPantone().get(color) || [];
    const filtro = (this.lineaTintaFilter() || '').toLowerCase();
    if (!filtro) return pedidos;
    return pedidos.filter(p => (p.lineaTinta || '').toLowerCase().includes(filtro));
  }

  parseColores(coloresData: any): string[] {
    if (!coloresData) return [];
    try {
      if (typeof coloresData === 'string') return JSON.parse(coloresData);
      if (Array.isArray(coloresData)) return coloresData;
    } catch {}
    return [];
  }

  getPantoneInfo(colorName: string): { hex: string; displayName: string } {
    if (!colorName) return { hex: '#CCCCCC', displayName: 'Sin color' };
    let search = colorName;
    if (colorName.toUpperCase().startsWith('P_')) search = colorName.substring(2);
    const results = this.pantoneService.searchColors(search);
    if (results?.length > 0) return { hex: results[0].hex, displayName: results[0].displayName };
    const map: Record<string, string> = {
      'CYAN': '#00AEEF', 'MAGENTA': '#EC008C', 'AMARILLO': '#FFF200', 'YELLOW': '#FFF200',
      'NEGRO': '#000000', 'BLACK': '#000000', 'BLANCO': '#FFFFFF', 'WHITE': '#FFFFFF',
      'VERDE': '#00A651', 'GREEN': '#00A651', 'NARANJA': '#FF6900', 'ORANGE': '#FF6900',
      'VIOLETA': '#8B3F8F', 'VIOLET': '#8B3F8F'
    };
    return { hex: map[colorName.toUpperCase()] || '#CCCCCC', displayName: colorName };
  }

  getTextColor(hex: string): string {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128 ? '#000000' : '#FFFFFF';
  }

  async refresh() {
    this.expandedPantones.set(new Set());
    this.pedidosByPantone.set(new Map());
    await this.cargarDatos();
  }

  async onMesChange(value: any) {
    this.mesFilter.set(value);
    this.fechaDesde.set(null);
    this.fechaHasta.set(null);
    await this.cargarDatos();
  }

  async buscarPorFechas() {
    if (this.fechaDesde() || this.fechaHasta()) {
      this.mesFilter.set(null);
    }
    await this.cargarDatos();
  }

  async limpiarFiltros() {
    this.searchTerm.set('');
    this.lineaTintaFilter.set(null);
    this.mesFilter.set(null);
    this.fechaDesde.set(null);
    this.fechaHasta.set(null);
    await this.cargarDatos();
  }

  // ===== EXPORTAR EXCEL POR PANTONE =====
  async exportPantoneExcel(pantone: PantoneMes, event: Event) {
    event.stopPropagation();
    const pedidos = this.getPedidos(pantone.color);
    if (pedidos.length === 0) {
      // Si no están cargados, cargar primero
      await this.cargarPedidosPantone(pantone);
    }
    const data = this.getPedidos(pantone.color);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(pantone.color);

    sheet.mergeCells('A1:H1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `Pantone: ${pantone.color} — ${pantone.cantidad} usos | ${pantone.kilos.toFixed(1)} kg | ${pantone.metros.toFixed(0)} m`;
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: 'center' };

    const headers = ['OT SAP', 'Artículo', 'Descripción', 'Máquina', 'Kilos', 'Metros', 'Línea Tinta', 'Colores'];
    const headerRow = sheet.addRow(headers);
    headerRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
      cell.alignment = { horizontal: 'center' };
    });

    data.forEach(p => {
      sheet.addRow([p.otSap, p.articulo, p.descripcion || '', p.maquina ? `M${p.maquina}` : '—', p.kilos, p.metros, p.lineaTinta || '', p.colores.join(', ')]);
    });

    const totalKilos = data.reduce((s, p) => s + p.kilos, 0);
    const totalMetros = data.reduce((s, p) => s + p.metros, 0);
    const totalsRow = sheet.addRow(['', '', '', 'TOTAL:', totalKilos, totalMetros, '', `${data.length} pedidos`]);
    totalsRow.eachCell((cell, col) => {
      cell.font = { bold: true };
      if (col === 5) cell.font = { bold: true, color: { argb: 'FF059669' } };
      if (col === 6) cell.font = { bold: true, color: { argb: 'FF2563EB' } };
    });

    sheet.columns = [{ width: 14 }, { width: 14 }, { width: 25 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 14 }, { width: 30 }];

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pantone_${pantone.color.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    this.snackBar.open(`Excel exportado: ${pantone.color}`, 'OK', { duration: 2000 });
  }

  // ===== EXPORTAR PDF POR PANTONE =====
  async exportPantonePdf(pantone: PantoneMes, event: Event) {
    event.stopPropagation();
    const pedidos = this.getPedidos(pantone.color);
    if (pedidos.length === 0) {
      await this.cargarPedidosPantone(pantone);
    }
    const data = this.getPedidos(pantone.color);

    const doc = new jsPDF('landscape', 'mm', 'a4');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Pantone: ${pantone.color}`, 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`${pantone.cantidad} usos · ${pantone.kilos.toFixed(1)} kg · ${pantone.metros.toFixed(0)} m · Máquinas: ${pantone.maquinas.map(m => 'M' + m).join(', ') || 'N/A'}`, 14, 25);
    doc.setTextColor(0);

    const totalKilos = data.reduce((s, p) => s + p.kilos, 0);
    const totalMetros = data.reduce((s, p) => s + p.metros, 0);

    const tableData = data.map(p => [
      p.otSap, p.articulo, p.descripcion || '—', p.maquina ? `M${p.maquina}` : '—',
      p.kilos.toFixed(1), p.metros.toFixed(1), p.lineaTinta || '—', p.colores.join(', ')
    ]);
    tableData.push(['', '', '', 'TOTAL:', totalKilos.toFixed(1), totalMetros.toFixed(1), '', '']);

    autoTable(doc, {
      startY: 30,
      head: [['OT SAP', 'Artículo', 'Descripción', 'Máquina', 'Kilos', 'Metros', 'Línea Tinta', 'Colores']],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 245, 255] },
      didParseCell: (data: any) => {
        if (data.section === 'body' && data.row.index === tableData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [240, 240, 255];
          if (data.column.index === 4) data.cell.styles.textColor = [5, 150, 105];
          if (data.column.index === 5) data.cell.styles.textColor = [37, 99, 235];
        }
      },
      columnStyles: { 0: { cellWidth: 22 }, 1: { cellWidth: 22 }, 2: { cellWidth: 45 }, 3: { cellWidth: 18 }, 4: { cellWidth: 16, halign: 'right' }, 5: { cellWidth: 16, halign: 'right' }, 6: { cellWidth: 25 }, 7: { cellWidth: 50 } }
    });

    doc.save(`Pantone_${pantone.color.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    this.snackBar.open(`PDF exportado: ${pantone.color}`, 'OK', { duration: 2000 });
  }

  // ===== EXPORTAR EXCEL GENERAL =====
  async exportGeneralExcel() {
    const pantones = this.filteredPantones();
    if (pantones.length === 0) {
      this.snackBar.open('No hay datos para exportar', 'OK', { duration: 2000 });
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Pantones');

    sheet.mergeCells('A1:G1');
    sheet.getCell('A1').value = `Reporte de Pantones — ${this.rangoMeses()}`;
    sheet.getCell('A1').font = { bold: true, size: 14 };
    sheet.getCell('A1').alignment = { horizontal: 'center' };

    const headers = ['#', 'Pantone', 'Usos', 'Kilos', 'Metros', 'Artículos', 'Máquinas'];
    const headerRow = sheet.addRow(headers);
    headerRow.eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
      cell.alignment = { horizontal: 'center' };
    });

    pantones.forEach((p, i) => {
      sheet.addRow([i + 1, p.color, p.cantidad, p.kilos, p.metros, p.articulos.length, p.maquinas.map(m => `M${m}`).join(', ')]);
    });

    sheet.columns = [{ width: 5 }, { width: 16 }, { width: 8 }, { width: 12 }, { width: 12 }, { width: 10 }, { width: 20 }];

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pantones_General.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    this.snackBar.open('Excel exportado', 'OK', { duration: 2000 });
  }
}
