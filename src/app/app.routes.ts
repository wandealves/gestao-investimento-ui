import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'investments',
    loadComponent: () => import('./components/investment-list/investment-list.component').then(m => m.InvestmentListComponent)
  },
  {
    path: 'investments/new',
    loadComponent: () => import('./components/investment-form/investment-form.component').then(m => m.InvestmentFormComponent)
  },
  {
    path: 'dividends',
    loadComponent: () => import('./components/dividend-tracking/dividend-tracking.component').then(m => m.DividendTrackingComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
