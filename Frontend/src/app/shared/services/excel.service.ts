import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';

/**
 * Servicio para manejo de archivos Excel usando ExcelJS
 * Reemplazo seguro de XLSX (sin vulnerabilidades)
 */
@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  /**
   * Exportar datos a Excel
   * @param data Array de objetos a exportar
   * @param fileName Nombre del archivo (sin extensión)
   * @param sheetName Nombre de la hoja
   */
  async exportToExcel(data: any[], fileName: string, sheetName: string = 'Datos'): Promise<void> {
    // Crear un nuevo libro de trabajo
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    if (data.length === 0) {
      throw new Error('No hay datos para exportar');
    }

    // Obtener las columnas del primer objeto
    const columns = Object.keys(data[0]).map(key => ({
      header: key,
      key: key,
      width: 15
    }));

    worksheet.columns = columns;

    // Agregar los datos
    data.forEach(item => {
      worksheet.addRow(item);
    });

    // Estilizar el header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Generar el archivo
    const buffer = await workbook.xlsx.writeBuffer();
    this.downloadFile(buffer, `${fileName}.xlsx`);
  }

  /**
   * Leer archivo Excel
   * @param file Archivo a leer
   * @returns Promise con los datos del Excel
   */
  async readExcel(file: File): Promise<any[][]> {
    const workbook = new ExcelJS.Workbook();
    const arrayBuffer = await file.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new Error('No se encontró ninguna hoja en el archivo');
    }

    const data: any[][] = [];
    worksheet.eachRow((row, rowNumber) => {
      const rowData: any[] = [];
      row.eachCell((cell, colNumber) => {
        rowData.push(cell.value);
      });
      data.push(rowData);
    });

    return data;
  }

  /**
   * Leer archivo Excel y convertir a JSON
   * @param file Archivo a leer
   * @param hasHeader Si la primera fila es el header
   * @returns Promise con los datos en formato JSON
   */
  async readExcelAsJSON(file: File, hasHeader: boolean = true): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    const arrayBuffer = await file.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new Error('No se encontró ninguna hoja en el archivo');
    }

    const data: any[] = [];
    let headers: string[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (hasHeader && rowNumber === 1) {
        // Primera fila como headers
        row.eachCell((cell) => {
          headers.push(cell.value?.toString() || '');
        });
      } else {
        const rowData: any = {};
        row.eachCell((cell, colNumber) => {
          const key = hasHeader ? headers[colNumber - 1] : `col${colNumber}`;
          rowData[key] = cell.value;
        });
        data.push(rowData);
      }
    });

    return data;
  }

  /**
   * Descargar archivo
   */
  private downloadFile(buffer: ArrayBuffer, fileName: string): void {
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
