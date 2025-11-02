import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface MachineProgram {
  id?: number;
  articulo: string;
  otSap: string;
  cliente: string;
  referencia: string;
  td: string;
  colores: string[];
  sustrato: string;
  kilos: number;
  estado: 'LISTO' | 'CORRIENDO' | 'SUSPENDIDO' | 'TERMINADO';
  observaciones?: string;
  lastActionBy?: string;
  lastActionAt?: Date;
  machineNumber: number;
}

interface UserPermissions {
  canLoadExcel: boolean;
  canDownloadTemplate: boolean;
  canViewFF459: boolean;
  canClearPrograms: boolean;
}

interface MachineStats {
  totalPrograms: number;
  readyPrograms: number;
  runningPrograms: number;
  suspendedPrograms: number;
  completedPrograms: number;
}

@Component({
  selector: 'app-machines',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatCardModule,
    FormsModule
  ],
  templateUrl: './machines.html',
  styleUrls: ['./machines.scss']
})
export class MachinesComponent implements OnInit {
  private http = inject(HttpClient);
  
  // Señales reactivas
  loading = signal(false);
  selectedMachineNumber = signal<number | null>(null);
  programs = signal<MachineProgram[]>([]);
  expandedColors = signal<Set<string>>(new Set());
  
  // Estado del diálogo de suspensión
  showSuspendDialog = false;
  currentProgramToSuspend: MachineProgram | null = null;
  suspendReason = '';
  
  // Configuración
  machineNumbers = Array.from({ length: 11 }, (_, i) => i + 11); // Máquinas 11-21
  programDisplayedColumns = [
    'articulo', 'otSap', 'cliente', 'referencia', 'td', 
    'colores', 'sustrato', 'kilos', 'operario', 'estado', 'acciones'
  ];

  // Permisos del usuario (similar a diseño)
  userPermissions = computed((): UserPermissions => ({
    canLoadExcel: true,
    canDownloadTemplate: true,
    canViewFF459: true,
    canClearPrograms: true
  }));
  
  // Computed properties
  selectedMachinePrograms = computed(() => {
    const selected = this.selectedMachineNumber();
    if (!selected) return [];
    return this.programs().filter(p => p.machineNumber === selected);
  });

  // Estadísticas de la máquina seleccionada
  selectedMachineStats = computed((): MachineStats => {
    const programs = this.selectedMachinePrograms();
    return {
      totalPrograms: programs.length,
      readyPrograms: programs.filter(p => p.estado === 'LISTO').length,
      runningPrograms: programs.filter(p => p.estado === 'CORRIENDO').length,
      suspendedPrograms: programs.filter(p => p.estado === 'SUSPENDIDO').length,
      completedPrograms: programs.filter(p => p.estado === 'TERMINADO').length
    };
  });

  ngOnInit() {
    console.log('🚀 Inicializando módulo de máquinas...');
    console.log('🏭 Máquinas disponibles:', this.machineNumbers);
    
    // Cargar programas desde la base de datos
    this.loadPrograms();
    
    // Seleccionar la primera máquina por defecto
    if (this.machineNumbers.length > 0) {
      console.log('🎯 Seleccionando máquina por defecto:', this.machineNumbers[0]);
      this.selectMachine(this.machineNumbers[0]);
    }
  }

  async loadPrograms() {
    this.loading.set(true);
    try {
      // Verificar si hay token antes de hacer la petición
      const token = localStorage.getItem('flexoapp_token');
      if (!token) {
        console.warn('🔐 No hay token de autenticación disponible');
        const shouldLogin = confirm(`🔐 Sesión requerida

Para acceder a los datos de máquinas necesitas estar autenticado.

¿Quieres ir a la página de login?

✅ SÍ - Ir a login
❌ NO - Intentar login automático de prueba`);

        if (shouldLogin) {
          window.location.href = '/login';
          return;
        } else {
          await this.tryAutoLogin();
          return;
        }
      }

      console.log('🔄 Cargando programas de máquinas desde:', `${environment.apiUrl}/machine-programs`);
      
      // Llamada al API para obtener todos los programas
      const response = await firstValueFrom(this.http.get<any>(`${environment.apiUrl}/machine-programs`));
      
      console.log('📡 Respuesta del servidor:', response);
      
      if (response && response.success && response.data) {
        // Mapear los datos del API al formato del frontend
        const programs: MachineProgram[] = response.data.map((program: any) => {
          // Parsear colores si vienen como string JSON
          let colores: string[] = [];
          if (program.colores) {
            try {
              colores = typeof program.colores === 'string' 
                ? JSON.parse(program.colores) 
                : program.colores;
            } catch (e) {
              console.warn('Error parseando colores para programa:', program.id, e);
              colores = [];
            }
          }

          return {
            id: program.id,
            articulo: program.articulo || '',
            otSap: program.otSap || '',
            cliente: program.cliente || '',
            referencia: program.referencia || '',
            td: program.td || '',
            colores: colores,
            sustrato: program.sustrato || '',
            kilos: program.kilos || 0,
            estado: program.estado || 'LISTO',
            machineNumber: program.machineNumber || 11,
            lastActionBy: program.updatedByUser?.firstName && program.updatedByUser?.lastName 
              ? `${program.updatedByUser.firstName} ${program.updatedByUser.lastName}`.trim()
              : program.lastActionBy || 'Sistema',
            lastActionAt: program.updatedAt ? new Date(program.updatedAt) : 
                         program.lastActionAt ? new Date(program.lastActionAt) : new Date(),
            observaciones: program.observaciones || ''
          };
        });
        
        console.log(`✅ ${programs.length} programas cargados exitosamente`);
        this.programs.set(programs);
        
        // Mostrar estadísticas en consola
        const stats = {
          total: programs.length,
          porMaquina: programs.reduce((acc, p) => {
            acc[p.machineNumber] = (acc[p.machineNumber] || 0) + 1;
            return acc;
          }, {} as Record<number, number>),
          porEstado: programs.reduce((acc, p) => {
            acc[p.estado] = (acc[p.estado] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        };
        console.log('📊 Estadísticas de programas:', stats);
        
      } else {
        console.warn('⚠️ Respuesta del servidor sin datos válidos:', response);
        this.programs.set([]);
      }
    } catch (error: any) {
      console.error('❌ Error cargando programas:', error);
      
      // Manejo específico para error 401 (No autorizado)
      if (error.status === 401) {
        console.warn('🔐 Error de autenticación detectado');
        
        const shouldTryLogin = confirm(`🔐 Sesión no válida o expirada

Para acceder a los datos de máquinas necesitas estar autenticado.

OPCIONES:
✅ ACEPTAR - Login automático con credenciales de prueba (admin/admin123)
❌ CANCELAR - Ir a la página de login manual

¿Quieres intentar el login automático?`);

        if (shouldTryLogin) {
          await this.tryAutoLogin();
          return; // Salir aquí, tryAutoLogin llamará a loadPrograms() de nuevo si tiene éxito
        } else {
          // Redirigir a login
          alert(`🔐 Redirigiendo al login

Ve a la página de login e ingresa:
• Usuario: admin  
• Contraseña: admin123

Después podrás acceder a los datos de máquinas.`);
          window.location.href = '/login';
          return;
        }
      }
      
      // Mostrar mensaje de error específico y detallado para otros errores
      let errorMessage = 'Error de conexión con la base de datos';
      let technicalDetails = '';
      
      if (error.status === 0) {
        errorMessage = 'No se puede conectar al servidor backend';
        technicalDetails = `Verifica que el backend esté ejecutándose en ${environment.apiUrl}`;
      } else if (error.status === 404) {
        errorMessage = 'Endpoint de API no encontrado';
        technicalDetails = 'El controlador de máquinas no está disponible';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor';
        technicalDetails = 'Problema en la base de datos o lógica del servidor';
      } else if (error.name === 'TimeoutError') {
        errorMessage = 'Tiempo de espera agotado';
        technicalDetails = 'La consulta a la base de datos tardó demasiado';
      }
      
      // Mostrar error en consola para debugging
      console.error('🔍 Detalles del error:', {
        status: error.status,
        message: error.message,
        url: error.url,
        error: error.error
      });
      
      alert(`❌ ${errorMessage}

🔧 Detalles técnicos:
${technicalDetails}

💡 Soluciones:
• Verifica que el backend esté ejecutándose
• Revisa la conexión a la base de datos MySQL
• Confirma que el endpoint /api/machine-programs esté disponible
• Verifica los permisos de usuario

🌐 URL del API: ${environment.apiUrl}/machine-programs`);
      
      // Establecer array vacío en caso de error
      this.programs.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Intentar login automático para pruebas
   */
  async tryAutoLogin() {
    try {
      console.log('🔐 Intentando login automático...');
      
      // Credenciales de prueba (deberían estar en un servicio de configuración)
      const loginData = {
        userCode: 'admin',
        password: 'admin123'
      };
      
      const loginResponse = await firstValueFrom(
        this.http.post<any>(`${environment.apiUrl}/auth/login`, loginData)
      );
      
      if (loginResponse && loginResponse.token) {
        console.log('✅ Login automático exitoso');
        
        // Guardar token en localStorage (simulando el AuthService)
        localStorage.setItem('flexoapp_token', loginResponse.token);
        if (loginResponse.user) {
          localStorage.setItem('flexoapp_user', JSON.stringify(loginResponse.user));
        }
        
        alert(`✅ Login automático exitoso

👤 Usuario: ${loginResponse.user?.firstName || 'Admin'} ${loginResponse.user?.lastName || ''}
🔑 Token guardado correctamente

Recargando datos de máquinas...`);
        
        // Recargar programas ahora que estamos autenticados
        await this.loadPrograms();
        
      } else {
        throw new Error('Respuesta de login inválida');
      }
      
    } catch (loginError: any) {
      console.error('❌ Error en login automático:', loginError);
      
      alert(`❌ Error en login automático

🔧 Detalles:
• ${loginError.message || 'Error desconocido'}
• Verifica las credenciales de prueba
• Confirma que el endpoint /auth/login esté disponible

🌐 Redirigiendo a la página de login...`);
      
      // Redirigir a login manual
      window.location.href = '/login';
    }
  }

  selectMachine(machineNumber: number) {
    this.selectedMachineNumber.set(machineNumber);
  }

  trackByMachineNumber(_: number, machineNumber: number): number {
    return machineNumber;
  }

  getMachineStatusClass(machineNumber: number): string {
    const machinePrograms = this.programs().filter(p => p.machineNumber === machineNumber);
    const readyCount = machinePrograms.filter(p => p.estado === 'LISTO').length;
    
    if (readyCount >= 8) return 'machine-status-good';
    if (readyCount >= 4) return 'machine-status-warning';
    return 'machine-status-critical';
  }

  getMachineStatusTooltip(machineNumber: number): string {
    const machinePrograms = this.programs().filter(p => p.machineNumber === machineNumber);
    const readyCount = machinePrograms.filter(p => p.estado === 'LISTO').length;
    return `Máquina ${machineNumber}: ${readyCount} programas listos`;
  }

  showProgramTable(): boolean {
    return this.selectedMachineNumber() !== null;
  }

  getNumericOtSap(otSap: string): string {
    return otSap.replace(/\D/g, '');
  }

  formatTdCode(td: string): string {
    return td.toUpperCase();
  }

  // Manejo de colores
  isColorsExpanded(programId: string): boolean {
    return this.expandedColors().has(programId);
  }

  toggleColors(programId: string) {
    const expanded = new Set(this.expandedColors());
    if (expanded.has(programId)) {
      expanded.delete(programId);
    } else {
      expanded.add(programId);
    }
    this.expandedColors.set(expanded);
  }

  closeColors(programId: string) {
    const expanded = new Set(this.expandedColors());
    expanded.delete(programId);
    this.expandedColors.set(expanded);
  }

  // Cambio de estado
  async changeStatus(program: MachineProgram, newStatus: MachineProgram['estado']) {
    try {
      this.loading.set(true);
      
      console.log(`🔄 Cambiando estado de programa ${program.id} a ${newStatus}`);
      
      // Llamada al API para cambiar estado
      const changeStatusDto = {
        estado: newStatus,
        observaciones: newStatus === 'SUSPENDIDO' ? program.observaciones : null
      };
      
      const response = await firstValueFrom(this.http.patch<any>(
        `${environment.apiUrl}/machine-programs/${program.id}/status`, 
        changeStatusDto
      ));
      
      if (response && response.success) {
        console.log(`✅ Estado cambiado exitosamente a ${newStatus}`);
        
        // Actualizar el estado localmente con los datos del servidor
        const programs = this.programs();
        const programIndex = programs.findIndex(p => p.id === program.id);
        if (programIndex !== -1) {
          programs[programIndex] = {
            ...programs[programIndex],
            estado: newStatus,
            lastActionBy: response.data?.lastActionBy || 'Usuario Actual',
            lastActionAt: response.data?.lastActionAt ? new Date(response.data.lastActionAt) : new Date(),
            observaciones: response.data?.observaciones || programs[programIndex].observaciones
          };
          this.programs.set([...programs]);
        }
        
        // Mostrar mensaje de éxito
        const statusMessages = {
          'LISTO': 'Programa marcado como LISTO',
          'CORRIENDO': 'Programa iniciado - CORRIENDO',
          'SUSPENDIDO': 'Programa SUSPENDIDO',
          'TERMINADO': 'Programa TERMINADO exitosamente'
        };
        
        alert(`✅ ${statusMessages[newStatus] || 'Estado actualizado'}\n\n📋 Programa: ${program.articulo}\n🏭 Máquina: ${program.machineNumber}\n⏰ ${new Date().toLocaleString()}`);
        
      } else {
        throw new Error('Respuesta del servidor inválida');
      }
      
    } catch (error: any) {
      console.error('❌ Error cambiando estado:', error);
      
      let errorMessage = 'Error al cambiar el estado del programa';
      if (error.status === 404) {
        errorMessage = 'Programa no encontrado en la base de datos';
      } else if (error.status === 400) {
        errorMessage = 'Estado inválido o datos incorrectos';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor al actualizar el estado';
      }
      
      alert(`❌ ${errorMessage}\n\n🔧 Detalles:\n• Programa: ${program.articulo}\n• Estado deseado: ${newStatus}\n• Error: ${error.message || 'Error desconocido'}`);
    } finally {
      this.loading.set(false);
    }
  }

  // Suspensión de programas
  suspendProgram(program: MachineProgram) {
    this.currentProgramToSuspend = program;
    this.suspendReason = '';
    this.showSuspendDialog = true;
  }

  closeSuspendDialog() {
    this.showSuspendDialog = false;
    this.currentProgramToSuspend = null;
    this.suspendReason = '';
  }

  selectPredefinedReason(reason: string) {
    if (this.suspendReason.includes(reason)) {
      this.suspendReason = this.suspendReason.replace(reason, '').trim();
    } else {
      this.suspendReason = this.suspendReason ? `${this.suspendReason}, ${reason}` : reason;
    }
  }

  async confirmSuspend() {
    if (!this.currentProgramToSuspend || !this.suspendReason.trim()) return;

    try {
      this.loading.set(true);
      
      console.log(`⏸️ Suspendiendo programa ${this.currentProgramToSuspend.id} con motivo: ${this.suspendReason}`);
      
      // Llamada al API para suspender con motivo
      const changeStatusDto = {
        estado: 'SUSPENDIDO',
        observaciones: this.suspendReason.trim()
      };
      
      const response = await firstValueFrom(this.http.patch<any>(
        `${environment.apiUrl}/machine-programs/${this.currentProgramToSuspend.id}/status`, 
        changeStatusDto
      ));
      
      if (response && response.success) {
        console.log('✅ Programa suspendido exitosamente');
        
        // Actualizar el estado localmente
        const programs = this.programs();
        const index = programs.findIndex(p => p.id === this.currentProgramToSuspend!.id);
        if (index !== -1) {
          programs[index] = {
            ...programs[index],
            estado: 'SUSPENDIDO',
            observaciones: this.suspendReason,
            lastActionBy: response.data?.lastActionBy || 'Usuario Actual',
            lastActionAt: response.data?.lastActionAt ? new Date(response.data.lastActionAt) : new Date()
          };
          this.programs.set([...programs]);
        }
        
        // Mostrar mensaje de confirmación
        alert(`⏸️ Programa suspendido exitosamente

📋 Programa: ${this.currentProgramToSuspend.articulo}
🏭 Máquina: ${this.currentProgramToSuspend.machineNumber}
📝 Motivo: ${this.suspendReason}
⏰ ${new Date().toLocaleString()}`);
        
        this.closeSuspendDialog();
        
      } else {
        throw new Error('Respuesta del servidor inválida');
      }
      
    } catch (error: any) {
      console.error('❌ Error suspendiendo programa:', error);
      
      let errorMessage = 'Error al suspender el programa';
      if (error.status === 404) {
        errorMessage = 'Programa no encontrado en la base de datos';
      } else if (error.status === 400) {
        errorMessage = 'Datos de suspensión inválidos';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor al suspender';
      }
      
      alert(`❌ ${errorMessage}\n\n🔧 Detalles:\n• Programa: ${this.currentProgramToSuspend?.articulo}\n• Motivo: ${this.suspendReason}\n• Error: ${error.message || 'Error desconocido'}`);
    } finally {
      this.loading.set(false);
    }
  }

  // Carga de archivos Excel
  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      alert('Por favor selecciona un archivo Excel (.xlsx, .xls) o CSV válido');
      return;
    }

    // Validar tamaño del archivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. El tamaño máximo permitido es 10MB.');
      return;
    }

    this.loading.set(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('moduleType', 'machines');
      formData.append('timestamp', new Date().toISOString());

      // Llamada al API para procesar el archivo
      const response = await firstValueFrom(this.http.post<any>(`${environment.apiUrl}/machine-programs/upload-programming`, formData));
      
      if (response && response.success) {
        // Actualizar la lista de programas con los datos cargados
        const newPrograms = response.data || [];
        this.programs.set(newPrograms);
        
        // Mostrar mensaje de éxito detallado
        const successMessage = `✅ Archivo procesado exitosamente
        
📊 Resumen de carga:
• ${newPrograms.length} programas cargados
• ${newPrograms.filter((p: MachineProgram) => p.estado === 'LISTO').length} programas listos
• ${new Set(newPrograms.map((p: MachineProgram) => p.machineNumber)).size} máquinas programadas

El archivo "${file.name}" se procesó correctamente.`;
        
        alert(successMessage);
        
        // Limpiar el input file
        event.target.value = '';
        
        // Si hay programas cargados, seleccionar la primera máquina con programas
        if (newPrograms.length > 0) {
          const firstMachineWithPrograms = newPrograms[0].machineNumber;
          this.selectMachine(firstMachineWithPrograms);
        }
        
      } else {
        throw new Error(response?.message || 'Error al procesar el archivo');
      }
      
    } catch (error: any) {
      let errorMessage = 'Error al procesar el archivo';
      if (error.status === 400) {
        errorMessage = 'Formato de archivo inválido. Verifica que el archivo tenga las columnas correctas.';
      } else if (error.status === 413) {
        errorMessage = 'El archivo es demasiado grande.';
      } else if (error.status === 0) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ ${errorMessage}
      
💡 Consejos:
• Usa la plantilla descargable
• Verifica que todas las columnas requeridas estén presentes
• El archivo no debe exceder 10MB`);
    } finally {
      this.loading.set(false);
    }
  }

  // Descargar plantilla Excel para programación de máquinas
  downloadTemplate() {
    try {
      // Crear datos de ejemplo para la plantilla con múltiples ejemplos
      const templateData = [
        {
          'Artículo': 'ART001',
          'OT SAP': '1000001',
          'Cliente': 'Cliente A',
          'Referencia': 'REF001',
          'TD': 'TD001',
          'Color 1': 'Azul',
          'Color 2': 'Rojo',
          'Color 3': 'Verde',
          'Color 4': '',
          'Color 5': '',
          'Color 6': '',
          'Sustrato': 'Papel',
          'Kilos': 1500,
          'Máquina': 1,
          'Observaciones': 'Trabajo estándar'
        },
        {
          'Artículo': 'ART002',
          'OT SAP': '1000002',
          'Cliente': 'Cliente B',
          'Referencia': 'REF002',
          'TD': 'TD002',
          'Color 1': 'Negro',
          'Color 2': 'Blanco',
          'Color 3': 'Amarillo',
          'Color 4': 'Magenta',
          'Color 5': '',
          'Color 6': '',
          'Sustrato': 'Plástico',
          'Kilos': 2000,
          'Máquina': 2,
          'Observaciones': 'Requiere atención especial'
        },
        {
          'Artículo': 'ART003',
          'OT SAP': '1000003',
          'Cliente': 'Cliente C',
          'Referencia': 'REF003',
          'TD': 'TD003',
          'Color 1': 'Cyan',
          'Color 2': 'Magenta',
          'Color 3': 'Amarillo',
          'Color 4': 'Negro',
          'Color 5': 'Pantone 123',
          'Color 6': 'Barniz',
          'Sustrato': 'Cartón',
          'Kilos': 3000,
          'Máquina': 3,
          'Observaciones': 'Trabajo complejo con 6 colores'
        }
      ];

      // Crear encabezado con instrucciones
      const instructions = [
        '# PLANTILLA DE PROGRAMACIÓN DE MÁQUINAS FLEXOGRÁFICAS',
        '# Instrucciones de uso:',
        '# 1. Complete todos los campos obligatorios',
        '# 2. Los colores vacíos pueden dejarse en blanco',
        '# 3. La máquina debe ser un número del 1 al 12',
        '# 4. Los kilos deben ser números enteros',
        '# 5. Elimine estas líneas de instrucciones antes de cargar',
        '#',
        '# Campos obligatorios: Artículo, OT SAP, Cliente, Referencia, TD, Sustrato, Kilos, Máquina',
        '# Campos opcionales: Color 1-6, Observaciones',
        '#'
      ];

      // Crear CSV con instrucciones y datos
      const headers = Object.keys(templateData[0]);
      const csvContent = [
        ...instructions,
        '',
        headers.join(','),
        ...templateData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
          }).join(',')
        )
      ].join('\n');

      // Crear y descargar archivo
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const fileName = `plantilla_programacion_maquinas_${new Date().toISOString().split('T')[0]}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL
      URL.revokeObjectURL(url);
      
      // Mostrar mensaje de éxito
      alert(`✅ Plantilla descargada exitosamente
      
📄 Archivo: ${fileName}

💡 Instrucciones:
• Complete todos los campos obligatorios
• Use los ejemplos como referencia
• Elimine las líneas de instrucciones antes de cargar
• Máximo 12 máquinas disponibles (1-12)`);
      
    } catch (error) {
      alert('❌ Error al descargar la plantilla. Inténtalo de nuevo.');
    }
  }

  // Abrir muestra del formato FF459
  openFF459Sample() {
    try {
      // Crear contenido HTML del formato FF459 mejorado
      const ff459Content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Formato FF459 - Muestra</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              font-size: 12px;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #000; 
              padding-bottom: 10px; 
              margin-bottom: 20px;
            }
            .section { margin: 15px 0; }
            .field { 
              margin: 8px 0; 
              display: flex;
              align-items: center;
            }
            .label { 
              font-weight: bold; 
              display: inline-block; 
              width: 120px; 
              margin-right: 10px;
            }
            .value {
              border-bottom: 1px solid #000;
              min-width: 200px;
              padding: 2px 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FORMATO FF459</h1>
            <h2>ORDEN DE PRODUCCIÓN FLEXOGRÁFICA</h2>
            <p>Muestra del formato estándar</p>
          </div>
          
          <div class="section">
            <div class="field">
              <span class="label">Artículo:</span>
              <span class="value">Ejemplo de artículo</span>
            </div>
            <div class="field">
              <span class="label">Cliente:</span>
              <span class="value">Cliente ejemplo</span>
            </div>
            <div class="field">
              <span class="label">Máquina:</span>
              <span class="value">1</span>
            </div>
          </div>
          
          <p><strong>Este es el formato que se genera automáticamente al imprimir un programa.</strong></p>
        </body>
        </html>
      `;

      // Abrir en nueva ventana con dimensiones específicas
      const newWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');
      if (newWindow) {
        newWindow.document.write(ff459Content);
        newWindow.document.close();
        newWindow.focus();
        
        // Mostrar mensaje informativo
        setTimeout(() => {
          alert(`📋 Formato FF459 abierto exitosamente
          
ℹ️ Información:
• Este es el formato estándar para órdenes de producción
• Se genera automáticamente al imprimir un programa
• Contiene toda la información necesaria para producción
• Los operarios deben completar las firmas y fechas`);
        }, 500);
        
      } else {
        alert(`❌ No se pudo abrir la ventana
        
💡 Solución:
• Permite las ventanas emergentes en tu navegador
• Verifica que no haya bloqueadores de pop-ups activos
• Intenta de nuevo después de permitir ventanas emergentes`);
      }
      
    } catch (error) {
      alert('❌ Error al abrir la muestra del formato FF459. Inténtalo de nuevo.');
    }
  }

  async clearAllPrograms() {
    const currentPrograms = this.programs();
    const confirmMessage = `⚠️ ADVERTENCIA: Limpiar toda la programación

Esta acción eliminará PERMANENTEMENTE:
• ${currentPrograms.length} programas cargados
• Toda la información de estado y operarios
• Historial de cambios y observaciones
• Los datos NO se podrán recuperar

🏭 Máquinas afectadas: ${new Set(currentPrograms.map(p => p.machineNumber)).size}

¿Estás COMPLETAMENTE SEGURO de continuar?`;

    const confirmed = confirm(confirmMessage);
    if (!confirmed) return;

    // Doble confirmación para operación crítica
    const doubleConfirm = confirm(`🚨 CONFIRMACIÓN FINAL

Vas a eliminar ${currentPrograms.length} programas de la base de datos.
Esta operación es IRREVERSIBLE.

Escribe "CONFIRMAR" en el siguiente prompt para continuar.`);
    
    if (!doubleConfirm) return;

    const finalConfirmation = prompt('Escribe "CONFIRMAR" para proceder con la eliminación:');
    if (finalConfirmation !== 'CONFIRMAR') {
      alert('❌ Operación cancelada. No se eliminó ningún programa.');
      return;
    }

    this.loading.set(true);
    try {
      console.log('🗑️ Iniciando limpieza de programación...');
      
      // Llamada al API para limpiar programación
      const response = await firstValueFrom(this.http.delete<any>(`${environment.apiUrl}/machine-programs/clear-programming`));
      
      if (response && response.success) {
        console.log(`✅ Programación limpiada: ${response.deletedCount} programas eliminados`);
        
        // Limpiar datos localmente
        this.programs.set([]);
        
        // Mostrar mensaje de éxito detallado
        alert(`✅ Programación limpiada exitosamente

📊 Resumen:
• ${response.deletedCount || currentPrograms.length} programas eliminados
• Base de datos limpia
• Todas las máquinas sin programación

⏰ Operación completada: ${new Date().toLocaleString()}`);
        
      } else {
        throw new Error('Respuesta del servidor inválida');
      }
      
    } catch (error: any) {
      console.error('❌ Error limpiando programación:', error);
      
      let errorMessage = 'Error al limpiar la programación';
      if (error.status === 403) {
        errorMessage = 'No tienes permisos para limpiar la programación';
      } else if (error.status === 500) {
        errorMessage = 'Error interno del servidor al limpiar datos';
      }
      
      alert(`❌ ${errorMessage}\n\n🔧 Detalles:\n• ${currentPrograms.length} programas no fueron eliminados\n• Error: ${error.message || 'Error desconocido'}\n• Contacta al administrador si el problema persiste`);
    } finally {
      this.loading.set(false);
    }
  }

  printProgram(program: MachineProgram) {
    try {
      // Crear contenido HTML del formato FF459 para impresión
      const ff459PrintContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>FF459 - ${program.articulo}</title>
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              font-size: 12px;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #000; 
              padding-bottom: 10px; 
              margin-bottom: 20px;
            }
            .section { margin: 15px 0; }
            .field { 
              margin: 8px 0; 
              display: flex;
              align-items: center;
            }
            .label { 
              font-weight: bold; 
              display: inline-block; 
              width: 120px; 
              margin-right: 10px;
            }
            .value {
              border-bottom: 1px solid #000;
              min-width: 200px;
              padding: 2px 5px;
            }
            .colors-grid { 
              display: grid; 
              grid-template-columns: repeat(3, 1fr); 
              gap: 10px; 
              margin: 10px 0; 
            }
            .color-box { 
              border: 1px solid #000; 
              padding: 8px; 
              text-align: center; 
              min-height: 30px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .observations-box {
              border: 1px solid #000;
              padding: 10px;
              min-height: 80px;
              margin: 10px 0;
            }
            .footer { 
              margin-top: 30px; 
              border-top: 1px solid #000; 
              padding-top: 20px; 
            }
            .signature-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-top: 20px;
            }
            .signature-field {
              border-bottom: 1px solid #000;
              height: 40px;
              margin-top: 10px;
            }
            .print-btn {
              margin: 20px 0;
              padding: 10px 20px;
              background: #2563eb;
              color: white;
              border: none;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="no-print">
            <button class="print-btn" onclick="window.print()">🖨️ Imprimir</button>
            <button class="print-btn" onclick="window.close()" style="background: #dc2626;">❌ Cerrar</button>
          </div>
          
          <div class="header">
            <h1>FORMATO FF459</h1>
            <h2>ORDEN DE PRODUCCIÓN FLEXOGRÁFICA</h2>
            <p>Fecha: ${new Date().toLocaleDateString('es-ES')}</p>
          </div>
          
          <div class="section">
            <div class="field">
              <span class="label">Artículo:</span>
              <span class="value">${program.articulo}</span>
            </div>
            <div class="field">
              <span class="label">OT SAP:</span>
              <span class="value">${program.otSap}</span>
            </div>
            <div class="field">
              <span class="label">Cliente:</span>
              <span class="value">${program.cliente}</span>
            </div>
            <div class="field">
              <span class="label">Referencia:</span>
              <span class="value">${program.referencia}</span>
            </div>
            <div class="field">
              <span class="label">TD:</span>
              <span class="value">${program.td}</span>
            </div>
            <div class="field">
              <span class="label">Sustrato:</span>
              <span class="value">${program.sustrato}</span>
            </div>
            <div class="field">
              <span class="label">Kilos:</span>
              <span class="value">${program.kilos.toLocaleString()} kg</span>
            </div>
            <div class="field">
              <span class="label">Máquina:</span>
              <span class="value">${program.machineNumber}</span>
            </div>
          </div>
          
          <div class="section">
            <h3>COLORES DE IMPRESIÓN</h3>
            <div class="colors-grid">
              ${program.colores.map((color, index) => 
                `<div class="color-box">${index + 1}. ${color}</div>`
              ).join('')}
              ${Array.from({length: Math.max(0, 6 - program.colores.length)}, (_, i) => 
                `<div class="color-box">${program.colores.length + i + 1}. -</div>`
              ).join('')}
            </div>
          </div>
          
          <div class="section">
            <h3>OBSERVACIONES</h3>
            <div class="observations-box">
              ${program.observaciones || 'Sin observaciones especiales'}
            </div>
          </div>
          
          <div class="footer">
            <div class="signature-section">
              <div>
                <div class="field">
                  <span class="label">Operario:</span>
                  <div class="signature-field"></div>
                </div>
                <div class="field">
                  <span class="label">Fecha Inicio:</span>
                  <div class="signature-field"></div>
                </div>
              </div>
              <div>
                <div class="field">
                  <span class="label">Supervisor:</span>
                  <div class="signature-field"></div>
                </div>
                <div class="field">
                  <span class="label">Fecha Fin:</span>
                  <div class="signature-field"></div>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // Abrir ventana de impresión
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(ff459PrintContent);
        printWindow.document.close();
        printWindow.focus();
        
        // Auto-imprimir después de cargar
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      } else {
        alert('Por favor permite las ventanas emergentes para imprimir el formato FF459');
      }
      
    } catch (error) {
      alert('Error al generar el formato de impresión');
    }
  }

  /**
   * Obtener el color del estado para la interfaz
   */
  getStatusColor(estado: string): string {
    const colors = {
      'LISTO': '#16a34a',
      'CORRIENDO': '#2563eb',
      'SUSPENDIDO': '#dc2626',
      'TERMINADO': '#059669'
    };
    return colors[estado as keyof typeof colors] || '#64748b';
  }

  /**
   * Obtener el icono del estado
   */
  getStatusIcon(estado: string): string {
    const icons = {
      'LISTO': 'check_circle',
      'CORRIENDO': 'play_circle',
      'SUSPENDIDO': 'pause_circle',
      'TERMINADO': 'task_alt'
    };
    return icons[estado as keyof typeof icons] || 'help';
  }

  /**
   * Formatear tiempo transcurrido
   */
  formatElapsedTime(startDate: Date, endDate?: Date): string {
    const end = endDate || new Date();
    const diff = end.getTime() - startDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours + 'h ' + minutes + 'm';
  }

  /**
   * Obtener progreso visual
   */
  getProgressWidth(progreso: number): string {
    return Math.min(100, Math.max(0, progreso)) + '%';
  }

  /**
   * Verificar si una máquina está activa
   */
  isMachineActive(machineNumber: number): boolean {
    const programs = this.programs().filter(p => p.machineNumber === machineNumber);
    return programs.some(p => p.estado === 'CORRIENDO');
  }

  /**
   * Obtener resumen de máquina
   */
  getMachineSummary(machineNumber: number): string {
    const programs = this.programs().filter(p => p.machineNumber === machineNumber);
    const running = programs.filter(p => p.estado === 'CORRIENDO').length;
    const ready = programs.filter(p => p.estado === 'LISTO').length;
    
    if (running > 0) {
      return running + ' corriendo, ' + ready + ' listos';
    }
    return ready + ' programas listos';
  }

  /**
   * Debug: Mostrar información de conexión y estado
   */
  debugConnectionInfo() {
    const programs = this.programs();
    const token = localStorage.getItem('flexoapp_token');
    const user = localStorage.getItem('flexoapp_user');
    
    const stats = {
      totalPrograms: programs.length,
      programsByMachine: programs.reduce((acc, p) => {
        acc[p.machineNumber] = (acc[p.machineNumber] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
      programsByStatus: programs.reduce((acc, p) => {
        acc[p.estado] = (acc[p.estado] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      apiUrl: environment.apiUrl,
      lastUpdate: new Date().toLocaleString(),
      hasToken: !!token,
      hasUser: !!user
    };

    console.log('🔍 Estado actual del módulo de máquinas:', stats);
    
    let userInfo = 'No autenticado';
    if (user) {
      try {
        const userData = JSON.parse(user);
        userInfo = `${userData.firstName || ''} ${userData.lastName || ''} (${userData.userCode || 'N/A'})`.trim();
      } catch (e) {
        userInfo = 'Usuario inválido';
      }
    }
    
    alert(`🔍 Información de Debug - Módulo de Máquinas

📊 Estadísticas:
• Total de programas: ${stats.totalPrograms}
• Máquinas con programas: ${Object.keys(stats.programsByMachine).length}
• Estados: ${Object.entries(stats.programsByStatus).map(([k,v]) => `${k}: ${v}`).join(', ')}

🔐 Autenticación:
• Token presente: ${stats.hasToken ? 'SÍ' : 'NO'}
• Usuario: ${userInfo}

🌐 Conexión:
• API URL: ${stats.apiUrl}
• Endpoint: /api/machine-programs
• Última actualización: ${stats.lastUpdate}

💾 Base de datos:
• Conectado: ${programs.length > 0 ? 'SÍ' : 'NO HAY DATOS'}
• Datos en tiempo real: ${stats.hasToken ? 'SÍ' : 'REQUIERE LOGIN'}`);
  }

  /**
   * Cargar datos de prueba locales para demostración
   */
  loadMockData() {
    const shouldLoadMock = confirm(`🧪 Cargar datos de prueba locales

Esta opción cargará datos de demostración locales para probar la interfaz sin conexión a la base de datos.

⚠️ Estos datos NO se guardarán en la base de datos.

¿Continuar?`);

    if (!shouldLoadMock) return;

    console.log('🧪 Cargando datos de prueba locales...');

    // Datos de prueba realistas
    const mockPrograms: MachineProgram[] = [
      {
        id: 1,
        articulo: 'F204567',
        otSap: '1000001',
        cliente: 'ABSORBENTES DE COLOMBIA S.A',
        referencia: 'PROTECTORES DIARIOS TELA SUAVE',
        td: 'TD1',
        colores: ['AZUL PANTONE 286C', 'ROJO PANTONE 186C', 'VERDE PANTONE 348C'],
        sustrato: 'R PE COEX BCO',
        kilos: 1500,
        estado: 'LISTO',
        machineNumber: 11,
        lastActionBy: 'Usuario Demo',
        lastActionAt: new Date(),
        observaciones: 'Programa de prueba'
      },
      {
        id: 2,
        articulo: 'F204568',
        otSap: '1000002',
        cliente: 'PRODUCTOS FAMILIA S.A',
        referencia: 'TOALLAS HIGIÉNICAS NOCTURNAS',
        td: 'TD2',
        colores: ['NEGRO', 'BLANCO', 'MAGENTA PANTONE 213C', 'AMARILLO PANTONE 116C'],
        sustrato: 'BOPP PERLADO',
        kilos: 2000,
        estado: 'CORRIENDO',
        machineNumber: 11,
        lastActionBy: 'Operario 1',
        lastActionAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
        observaciones: 'En producción'
      },
      {
        id: 3,
        articulo: 'F204569',
        otSap: '1000003',
        cliente: 'KIMBERLY CLARK',
        referencia: 'PAÑALES HUGGIES ETAPA 3',
        td: 'TD3',
        colores: ['CYAN PANTONE 306C', 'MAGENTA PANTONE 213C', 'AMARILLO PANTONE 116C', 'NEGRO'],
        sustrato: 'PE METALIZADO',
        kilos: 3500,
        estado: 'SUSPENDIDO',
        machineNumber: 12,
        lastActionBy: 'Supervisor',
        lastActionAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        observaciones: 'Suspendido por cambio de material'
      },
      {
        id: 4,
        articulo: 'F204570',
        otSap: '1000004',
        cliente: 'COLGATE PALMOLIVE',
        referencia: 'PASTA DENTAL COLGATE TOTAL',
        td: 'TD4',
        colores: ['AZUL PANTONE 286C', 'BLANCO', 'ROJO PANTONE 186C'],
        sustrato: 'LAMINADO ALU/PE',
        kilos: 800,
        estado: 'TERMINADO',
        machineNumber: 13,
        lastActionBy: 'Operario 2',
        lastActionAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
        observaciones: 'Completado exitosamente'
      },
      {
        id: 5,
        articulo: 'F204571',
        otSap: '1000005',
        cliente: 'UNILEVER ANDINA',
        referencia: 'SHAMPOO SEDAL CERAMIDAS',
        td: 'TD5',
        colores: ['DORADO PANTONE 871C', 'NEGRO', 'BLANCO'],
        sustrato: 'BOPP TRANSPARENTE',
        kilos: 1200,
        estado: 'LISTO',
        machineNumber: 14,
        lastActionBy: 'Sistema',
        lastActionAt: new Date(),
        observaciones: 'Listo para producción'
      }
    ];

    this.programs.set(mockPrograms);
    
    // Seleccionar la primera máquina con datos
    const firstMachineWithData = mockPrograms[0].machineNumber;
    this.selectMachine(firstMachineWithData);

    alert(`✅ Datos de prueba cargados exitosamente

📊 Resumen:
• ${mockPrograms.length} programas de demostración
• ${new Set(mockPrograms.map(p => p.machineNumber)).size} máquinas con programas
• Estados: ${Object.entries(mockPrograms.reduce((acc, p) => {
  acc[p.estado] = (acc[p.estado] || 0) + 1;
  return acc;
}, {} as Record<string, number>)).map(([k,v]) => `${k}: ${v}`).join(', ')}

🎯 Máquina ${firstMachineWithData} seleccionada automáticamente

⚠️ Recuerda: Estos son datos de prueba locales`);
  }
}