import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./shared/components/dashboard/dashboard').then(c => c.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./shared/components/login/login').then(c => c.LoginComponent)
  },
  {
    path: 'machines',
    loadComponent: () => import('./shared/components/machines/machines').then(c => c.MachinesComponent),
    canActivate: [AuthGuard, permissionGuard]
  },
  {
    path: 'design',
    loadComponent: () => import('./shared/components/diseño/diseno').then(c => c.DesignComponent),
    canActivate: [AuthGuard, permissionGuard]
  },
  {
    path: 'reports',
    loadComponent: () => import('./shared/components/reports/reports').then(c => c.ReportsComponent),
    canActivate: [AuthGuard, permissionGuard]
  },
  {
    path: 'documents',
    loadComponent: () => import('./shared/components/documento/documento').then(c => c.DocumentoComponent),
    canActivate: [AuthGuard, permissionGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./shared/components/profile/profile').then(c => c.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./auth/settings/settings').then(c => c.SettingsComponent),
    canActivate: [AuthGuard, permissionGuard]
  },
  {
    path: 'information',
    loadComponent: () => import('./shared/components/informacion/informacion').then(c => c.InformacionComponent),
    canActivate: [AuthGuard, permissionGuard]
  },
  {
    path: 'consulta-pedidos',
    loadComponent: () => import('./shared/components/consulta-pedidos/consulta-pedidos').then(c => c.ConsultaPedidosComponent),
    canActivate: [AuthGuard, permissionGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
