import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

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
    loadComponent: () => import('./auth/login/login').then(c => c.LoginComponent)
  },
  
  {
    path: 'machines',
    loadComponent: () => import('./shared/components/machines/machines').then(c => c.MachinesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'design',
    loadComponent: () => import('./shared/components/diseño/diseno').then(c => c.DesignComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'reports',
    loadComponent: () => import('./shared/components/reports/reports').then(c => c.ReportsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'documents',
    loadComponent: () => import('./shared/components/documento/documento').then(c => c.DocumentoComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./auth/profile/profile').then(c => c.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./auth/settings/settings').then(c => c.SettingsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'information',
    loadComponent: () => import('./shared/components/informacion/informacion').then(c => c.InformacionComponent),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];