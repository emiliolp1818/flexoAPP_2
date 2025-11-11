// ===== IMPORTACIONES DE ANGULAR CORE =====
// Importar funcionalidades básicas del framework Angular
import { Component, OnInit } from '@angular/core';
// Importar módulo común de Angular para directivas básicas
import { CommonModule } from '@angular/common';

// ===== DECORADOR DE COMPONENTE ANGULAR =====
// Define los metadatos del componente print-ff459
@Component({
  selector: 'app-print-ff459', // Selector HTML para usar el componente
  standalone: true, // Componente independiente (no requiere módulo)
  imports: [CommonModule], // Módulos importados que el componente necesita
  templateUrl: './print-ff459.html', // Archivo de plantilla HTML
  styleUrls: ['./print-ff459.scss'] // Archivo de estilos SCSS
})
export class PrintFF459Component implements OnInit {
  
  // ===== CONSTRUCTOR DEL COMPONENTE =====
  // Constructor vacío - no se necesitan dependencias inyectadas
  constructor() {
    // Log de inicialización del componente
    console.log('🖨️ Componente PrintFF459 inicializado');
  }

  // ===== MÉTODO DEL CICLO DE VIDA ngOnInit =====
  // Se ejecuta después de la inicialización del componente
  ngOnInit(): void {
    // Log de inicio del ciclo de vida
    console.log('📄 Formato FF-459 cargado y listo para imprimir');
    
    // ===== CONFIGURAR IMPRESIÓN AUTOMÁTICA (OPCIONAL) =====
    // Descomentar la siguiente línea si se desea abrir el diálogo de impresión automáticamente
    // setTimeout(() => window.print(), 500);
  }

  // ===== MÉTODO PARA IMPRIMIR EL FORMATO =====
  // Abre el diálogo nativo de impresión del navegador
  print(): void {
    // Log de inicio de impresión
    console.log('🖨️ Abriendo diálogo de impresión...');
    
    // Abrir el diálogo nativo de impresión del navegador
    window.print();
  }

  // ===== MÉTODO PARA CERRAR LA VENTANA =====
  // Cierra la ventana actual (útil cuando se abre en ventana nueva)
  close(): void {
    // Log de cierre
    console.log('❌ Cerrando ventana de formato FF-459');
    
    // Cerrar la ventana actual
    window.close();
  }
}
