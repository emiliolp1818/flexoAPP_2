import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PermissionsService } from '../../shared/services/permissions.service';
import { PERMISSIONS } from '../../shared/models/permission.model';
import { firstValueFrom } from 'rxjs';

// Mapa de ruta → permiso requerido
const ROUTE_PERMISSIONS: Record<string, string> = {
  'machines': PERMISSIONS.MODULE_MACHINES,
  'design': PERMISSIONS.MODULE_DESIGN,
  'reports': PERMISSIONS.MODULE_REPORTS,
  'documents': PERMISSIONS.MODULE_DOCUMENTS,
  'settings': PERMISSIONS.MODULE_SETTINGS,
  'information': PERMISSIONS.MODULE_INFORMATION,
  'consulta-pedidos': PERMISSIONS.MODULE_ORDER_QUERY
};

export const permissionGuard: CanActivateFn = async (route) => {
  const authService = inject(AuthService);
  const permissionsService = inject(PermissionsService);
  const router = inject(Router);

  // Verificar autenticación primero
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const path = route.routeConfig?.path || '';
  const requiredPermission = ROUTE_PERMISSIONS[path];

  // Si no requiere permiso especial, permitir acceso
  if (!requiredPermission) return true;

  // Cargar permisos si no están cargados
  if (permissionsService.permissions().length === 0) {
    const user = authService.getCurrentUser();
    if (user?.id) {
      try {
        await firstValueFrom(permissionsService.loadCurrentUserPermissions(Number(user.id)));
      } catch {
        // Si falla cargar permisos, permitir acceso (fallback)
        return true;
      }
    }
  }

  // Verificar permiso
  if (permissionsService.hasPermission(requiredPermission)) {
    return true;
  }

  // Sin permiso → redirigir al dashboard con mensaje
  router.navigate(['/dashboard'], { 
    queryParams: { denied: path } 
  });
  return false;
};
