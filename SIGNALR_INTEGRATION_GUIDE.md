# 📡 Guía de Integración SignalR - FlexoAPP

## ✅ Estado Actual

### Backend
- ✅ Hub creado: `backend/Hubs/MaquinasHub.cs`
- ✅ Servicio de notificaciones: `backend/Services/SignalRNotificationService.cs`
- ✅ Hub mapeado en Program.cs: `/hubs/maquinas`
- ✅ Servicio registrado en DI
- ✅ Build exitoso

### Frontend
- ✅ Paquete instalado: `@microsoft/signalr`
- ✅ Servicio creado: `Frontend/src/app/shared/services/signalr.service.ts`
- ✅ Build exitoso

---

## 🔧 Pasos para Activar SignalR

### 1. Inicializar SignalR en el Login

Editar `Frontend/src/app/core/services/auth.service.ts`:

```typescript
import { SignalRService } from '../../shared/services/signalr.service';

export class AuthService {
  private signalRService = inject(SignalRService);
  
  // En el método setSession, después de guardar el token:
  private setSession(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.permissionsService.setPermissions(user.permissions || []);
    
    // 🆕 Iniciar SignalR
    this.signalRService.startConnection(token).catch(err => {
      console.error('Error iniciando SignalR:', err);
    });
  }
  
  // En el método logout:
  logout(): void {
    // ... código existente ...
    
    // 🆕 Detener SignalR
    this.signalRService.stopConnection();
  }
}
```

### 2. Integrar en el Componente de Máquinas

Editar `Frontend/src/app/shared/components/machines/machines.ts`:

```typescript
import { SignalRService } from '../../services/signalr.service';
import { Subscription } from 'rxjs';

export class MachinesComponent implements OnInit, OnDestroy {
  private signalRService = inject(SignalRService);
  private signalRSubscriptions: Subscription[] = [];
  
  ngOnInit(): void {
    // ... código existente ...
    
    // 🆕 Suscribirse a notificaciones SignalR
    this.setupSignalRListeners();
  }
  
  private setupSignalRListeners(): void {
    // Máquina actualizada
    this.signalRSubscriptions.push(
      this.signalRService.machineUpdated$.subscribe(notification => {
        console.log('📢 Máquina actualizada:', notification);
        // Recargar la máquina específica o toda la lista
        this.loadMachines();
      })
    );
    
    // Estado cambiado
    this.signalRSubscriptions.push(
      this.signalRService.machineStateChanged$.subscribe(notification => {
        console.log('📢 Estado cambiado:', notification);
        this.showToast(
          `Máquina ${notification.machineNumber}: ${notification.oldState} → ${notification.newState}`,
          'info'
        );
        this.loadMachines();
      })
    );
    
    // Excel importado
    this.signalRSubscriptions.push(
      this.signalRService.excelImported$.subscribe(notification => {
        console.log('📢 Excel importado:', notification);
        this.showToast(
          `Excel importado: ${notification.created} creados, ${notification.updated} actualizados`,
          'success'
        );
        this.loadMachines();
      })
    );
    
    // Máquina eliminada
    this.signalRSubscriptions.push(
      this.signalRService.machineDeleted$.subscribe(notification => {
        console.log('📢 Máquina eliminada:', notification);
        this.loadMachines();
      })
    );
    
    // Refresh global
    this.signalRSubscriptions.push(
      this.signalRService.refreshAll$.subscribe(notification => {
        console.log('📢 Refresh global:', notification);
        this.loadMachines();
      })
    );
  }
  
  ngOnDestroy(): void {
    // 🆕 Limpiar suscripciones
    this.signalRSubscriptions.forEach(sub => sub.unsubscribe());
  }
}
```

### 3. Enviar Notificaciones desde el Backend

Editar `backend/Controllers/MaquinasController.cs`:

```csharp
using FlexoAPP.API.Services;

public class MaquinasController : ControllerBase
{
    private readonly ISignalRNotificationService _signalRService;
    
    public MaquinasController(
        // ... otros parámetros ...
        ISignalRNotificationService signalRService)
    {
        _signalRService = signalRService;
    }
    
    // Ejemplo: Al cambiar estado
    [HttpPatch("{otSap}/estado")]
    public async Task<IActionResult> UpdateEstado(string otSap, [FromBody] UpdateEstadoDto dto)
    {
        var maquina = await _context.Maquinas.FindAsync(otSap);
        var oldState = maquina.Estado;
        
        maquina.Estado = dto.Estado;
        await _context.SaveChangesAsync();
        
        // 🆕 Notificar cambio de estado
        await _signalRService.NotifyMachineStateChanged(
            otSap, 
            maquina.NumeroMaquina, 
            oldState, 
            dto.Estado, 
            User.Identity?.Name
        );
        
        return Ok();
    }
    
    // Ejemplo: Al importar Excel
    [HttpPost("import-excel/{machineNumber}")]
    public async Task<IActionResult> ImportExcel(int machineNumber, IFormFile file)
    {
        // ... lógica de importación ...
        
        // 🆕 Notificar importación
        await _signalRService.NotifyExcelImported(
            machineNumber,
            result.Created,
            result.Updated,
            User.Identity?.Name
        );
        
        return Ok(result);
    }
}
```

---

## 🎯 Eventos Disponibles

### Backend → Frontend

| Evento | Descripción | Payload |
|--------|-------------|---------|
| `MachineUpdated` | Máquina actualizada | `{ otSap, machineNumber, action, userName, timestamp }` |
| `MachineStateChanged` | Estado cambiado | `{ otSap, machineNumber, oldState, newState, userName, timestamp }` |
| `ExcelImported` | Excel importado | `{ machineNumber, created, updated, userName, timestamp }` |
| `MachineDeleted` | Máquina eliminada | `{ otSap, machineNumber, userName, timestamp }` |
| `RefreshAll` | Refresh global | `{ reason, timestamp }` |

---

## 🧪 Pruebas

### 1. Verificar Conexión
Abrir consola del navegador y buscar:
```
✅ SignalR conectado exitosamente
```

### 2. Probar Notificaciones
- Abrir 2 navegadores con usuarios diferentes
- Cambiar estado de una máquina en uno
- Verificar que el otro reciba la notificación automáticamente

### 3. Verificar Logs Backend
En Render, buscar en logs:
```
🔌 Cliente conectado: [usuario]
📢 Notificación enviada: Máquina X - OT Y - Acción: Z
```

---

## 🔒 Seguridad

- ✅ Hub requiere autenticación (`[Authorize]`)
- ✅ Token JWT se envía automáticamente
- ✅ Reconexión automática con estrategia exponencial
- ✅ Logs detallados para debugging

---

## 📊 Beneficios

1. **Sincronización en tiempo real** entre todos los clientes
2. **Sin polling** - más eficiente que consultar cada X segundos
3. **Notificaciones instantáneas** de cambios
4. **Mejor UX** - usuarios ven cambios inmediatamente
5. **Escalable** - soporta múltiples clientes simultáneos

---

## 🚀 Próximos Pasos

1. ✅ Implementar integración en auth.service.ts
2. ✅ Implementar listeners en machines.component.ts
3. ✅ Agregar notificaciones en MaquinasController
4. ✅ Probar en local
5. ✅ Desplegar a producción
6. ✅ Monitorear logs

---

## 📝 Notas

- SignalR usa WebSockets cuando está disponible, fallback a SSE o Long Polling
- La reconexión es automática si se pierde la conexión
- Los grupos permiten notificar solo a clientes interesados en una máquina específica
- El servicio es Singleton en backend para mantener el estado de conexiones

