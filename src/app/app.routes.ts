import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { SessionOpenPage } from './features/vehicles/session-open/session-open.page';
import { MainTabsPage } from './main-tabs.page';

export const routes: Routes = [
  // LOGIN
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then(m => m.default),
  },

  // LAYOUT TABS (con bottom tabs)
  {
    path: 'tabs',
    canActivate: [authGuard],
    component: MainTabsPage,
    children: [
      {
        path: 'vehicles',
        loadComponent: () =>
          import('./features/vehicles/vehicles-list.page')
            .then(m => m.VehiclesListPage),
      },
      {
  path: 'start',
  loadComponent: () =>
    import('./features/vehicles/vehicle-session-start/vehicle-session-start.page')
      .then(m => m.VehicleSessionStartPage),
},



      {
        path: 'jerrys',
        loadComponent: () =>
          import('./features/jerrys/jerrys-refill/jerrys-refill.page')
            .then(m => m.JerrysRefillPage),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./features/history/history.page')
            .then(m => m.default),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.page')
            .then(m => m.ProfilePage),
      },

      // por defecto → vehicles
      { path: '', redirectTo: 'vehicles', pathMatch: 'full' },
    ],
  },

  // SESIÓN ABIERTA
  {
    path: 'vehicles/:vehicleId/session-open',
    canActivate: [authGuard],
    component: SessionOpenPage,
  },

  // FIN DE JORNADA
  {
    path: 'end',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/vehicles/vehicle-session-end/vehicle-session-end.page')
        .then(m => m.VehicleSessionEndPage),
  },

  // ADMIN
  {
    path: 'admin/vehicles',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/vehicles-admin.component')
        .then(m => m.VehiclesAdminComponent),
  },

  // JERRYS
  {
    path: 'jerry-usage',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/jerrys/jerry-usage/jerry-usage.page')
        .then(m => m.JerryUsagePage),
  },
  {
    path: 'jerrys-refill',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/jerrys/jerrys-refill/jerrys-refill.page')
        .then(m => m.JerrysRefillPage),
  },

  // GREAT JOB
  {
    path: 'great-job',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/great-job/great-job.page')
        .then(m => m.GreatJobPage),
  },

  // REDIRECTS
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
