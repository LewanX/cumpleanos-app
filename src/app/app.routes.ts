import { Routes } from '@angular/router';
import { App } from './app';
import { AdminComponent } from './admin/admin';
import { LoginComponent } from './login/login';

export const routes: Routes = [
  {
    path: '',
    component: App
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'admin',
    component: AdminComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
