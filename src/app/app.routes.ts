import type { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProductListComponent } from './components/products/product-list/product-list.component';
import { ProductFormComponent } from './components/products/product-form/product-form.component';
import { ProductDetailComponent } from './components/products/product-detail/product-detail.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { XvAnosComponent } from './components/categories/xv-anos/xv-anos.component';
import { BautizosComponent } from './components/categories/bautizos/bautizos.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // Ruta principal - Home (sin autenticación requerida)
  { path: '', component: HomeComponent },

  // Rutas de categorías (sin autenticación requerida para ver productos)
  { path: 'xv-anos', component: XvAnosComponent },
  { path: 'bautizos', component: BautizosComponent },

  // 🔥 CORREGIDO: Rutas de usuario autenticado con lazy loading
  {
    path: 'favorites',
    loadComponent: () =>
      import('./components/favorites/favorites.component').then(
        (m) => m.FavoritesComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./components/cart/cart.component').then((m) => m.CartComponent),
    canActivate: [authGuard],
  },

  // 🔥 Ruta de detalle de producto (sin autenticación requerida para ver)
  { path: 'producto/:id', component: ProductDetailComponent },

  // Rutas de autenticación
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Dashboard (solo admin y empleados)
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard, adminGuard],
  },

  // Productos (todos los usuarios autenticados)
  {
    path: 'products',
    component: ProductListComponent,
    canActivate: [authGuard],
  },

  // Crear producto (solo admin y empleados)
  {
    path: 'products/new',
    component: ProductFormComponent,
    canActivate: [authGuard, adminGuard],
  },

  // Editar producto (solo admin y empleados)
  {
    path: 'products/edit/:id',
    component: ProductFormComponent,
    canActivate: [authGuard, adminGuard],
  },

  // Gestión de usuarios (solo admin)
  {
    path: 'users',
    component: UserManagementComponent,
    canActivate: [authGuard, adminGuard],
  },

  // Ruta wildcard - redirige al home si no encuentra la ruta
  { path: '**', redirectTo: '/' },
];
