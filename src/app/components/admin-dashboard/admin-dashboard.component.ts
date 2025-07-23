import { Component, type OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, type User } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { UserService } from '../../services/user.service';
import { LoadingComponent } from '../shared/loading/loading.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">🚀 Dashboard</h1>
        <p class="text-gray-600">
          Bienvenido, {{ currentUser?.name }} {{ currentUser?.lastName }}
        </p>
      </div>

      <app-loading *ngIf="loading"></app-loading>

      <div *ngIf="!loading">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="bg-blue-100 rounded-full p-3">
                <span class="text-2xl">📦</span>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Productos</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ stats.totalProducts }}
                </p>
              </div>
            </div>
          </div>

          <div
            class="bg-white rounded-lg shadow-md p-6"
            *ngIf="authService.isAdmin()"
          >
            <div class="flex items-center">
              <div class="bg-green-100 rounded-full p-3">
                <span class="text-2xl">👥</span>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ stats.totalUsers }}
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center">
              <div class="bg-red-100 rounded-full p-3">
                <span class="text-2xl">⚠️</span>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-600">Stock Bajo</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ stats.lowStock }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            🎯 Acciones Rápidas
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              routerLink="/products"
              class="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <span class="text-2xl mr-3">📋</span>
              <div>
                <p class="font-medium text-blue-900">Ver Productos</p>
                <p class="text-sm text-blue-600">Gestionar inventario</p>
              </div>
            </a>

            <a
              *ngIf="authService.isAdmin() || authService.isEmpleado()"
              routerLink="/products/new"
              class="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <span class="text-2xl mr-3">➕</span>
              <div>
                <p class="font-medium text-green-900">Nuevo Producto</p>
                <p class="text-sm text-green-600">Agregar al inventario</p>
              </div>
            </a>

            <div class="flex items-center p-4 bg-purple-50 rounded-lg">
              <span class="text-2xl mr-3">👑</span>
              <div>
                <p class="font-medium text-purple-900">Tu Rol</p>
                <p class="text-sm text-purple-600">
                  {{ currentUser?.role | titlecase }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class DashboardComponent implements OnInit {
  public authService = inject(AuthService);
  private productService = inject(ProductService);
  private userService = inject(UserService);

  currentUser: User | null = null;
  products: any[] = [];
  users: any[] = [];
  loading = true;
  stats = {
    totalProducts: 0,
    totalUsers: 0,
    lowStock: 0,
  };

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUserData();
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;

    this.productService.getAllProducts().subscribe({
      next: (response: any) => {
        this.products = response.data?.data || [];
        this.stats.totalProducts = this.products.length;
        this.stats.lowStock = this.products.filter(
          (p) => (p.quantity || 0) < 10
        ).length;
        this.checkLoadingComplete();
      },
      error: (error: any) => {
        console.error('Error cargando productos:', error);
        this.checkLoadingComplete();
      },
    });

    if (this.authService.isAdmin()) {
      this.userService.getAllUsers().subscribe({
        next: (response: any) => {
          this.users = response.data?.data || [];
          this.stats.totalUsers = this.users.length;
          this.checkLoadingComplete();
        },
        error: (error: any) => {
          console.error('Error cargando usuarios:', error);
          this.checkLoadingComplete();
        },
      });
    } else {
      this.checkLoadingComplete();
    }
  }

  private checkLoadingComplete() {
    setTimeout(() => {
      this.loading = false;
    }, 500);
  }
}
