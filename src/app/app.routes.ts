import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    canActivate: [loginGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'investments',
    loadComponent: () => import('./components/investment-list/investment-list.component').then(m => m.InvestmentListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'dividends',
    loadComponent: () => import('./components/dividend-tracking/dividend-tracking.component').then(m => m.DividendTrackingComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
