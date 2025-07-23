import { Component, type OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  ProductService,
  type Product,
} from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';
import { LoadingComponent } from '../../shared/loading/loading.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LoadingComponent],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">📦 Productos</h1>
          <p class="text-gray-600">Gestiona tu inventario de productos</p>
        </div>
        <a
          *ngIf="canEdit()"
          routerLink="/products/new"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          ➕ Nuevo Producto
        </a>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >🔍 Buscar</label
            >
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (keyup.enter)="onSearch()"
              placeholder="Buscar por nombre o código..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >🏷️ Categoría</label
            >
            <select
              [(ngModel)]="selectedCategory"
              (change)="onCategoryChange()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las categorías</option>
              <option *ngFor="let category of categories" [value]="category">
                {{ category }}
              </option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              (click)="onSearch()"
              class="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🔍 Buscar
            </button>
          </div>
        </div>
      </div>

      <app-loading *ngIf="loading"></app-loading>

      <div *ngIf="!loading">
        <div *ngIf="products.length === 0" class="text-center py-16">
          <span class="text-6xl">📦</span>
          <h2 class="text-2xl font-bold text-gray-900 mt-4">
            No hay productos
          </h2>
          <p class="text-gray-600 mt-2">
            No se encontraron productos con los filtros aplicados
          </p>
          <a
            *ngIf="canEdit()"
            routerLink="/products/new"
            class="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            ➕ Crear Primer Producto
          </a>
        </div>

        <div
          *ngIf="products.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div
            *ngFor="let product of products"
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div
              class="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center"
            >
              <span class="text-4xl">📦</span>
            </div>

            <div class="p-6">
              <div class="flex justify-between items-start mb-2">
                <h3 class="text-lg font-semibold text-gray-900 truncate">
                  {{ product.name }}
                </h3>
                <span
                  class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                >
                  {{ product.code }}
                </span>
              </div>

              <p
                *ngIf="product.description"
                class="text-gray-600 text-sm mb-3 line-clamp-2"
              >
                {{ product.description }}
              </p>

              <div class="flex justify-between items-center mb-4">
                <div>
                  <p class="text-2xl font-bold text-green-600">
                    \${{ product.price }}
                  </p>
                  <p *ngIf="product.category" class="text-sm text-gray-500">
                    {{ product.category }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-600">Stock</p>
                  <p
                    class="font-bold"
                    [ngClass]="{
                      'text-green-600': (product.quantity || 0) > 10,
                      'text-yellow-600':
                        (product.quantity || 0) > 0 &&
                        (product.quantity || 0) <= 10,
                      'text-red-600': (product.quantity || 0) === 0
                    }"
                  >
                    {{ product.quantity || 0 }}
                  </p>
                </div>
              </div>

              <div class="flex space-x-2" *ngIf="canEdit()">
                <a
                  [routerLink]="['/products/edit', product.id]"
                  class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  ✏️ Editar
                </a>
                <button
                  (click)="deleteProduct(product)"
                  class="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    `,
  ],
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  public authService = inject(AuthService);

  products: Product[] = [];
  loading = true;
  searchTerm = '';
  selectedCategory = '';
  categories: string[] = [];

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;

    const filters: any = {};
    if (this.searchTerm) filters.search = this.searchTerm;
    if (this.selectedCategory) filters.category = this.selectedCategory;

    this.productService.getAllProducts(filters).subscribe({
      next: (response: any) => {
        this.products = response.data?.data || [];
        this.extractCategories();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error cargando productos:', error);
        this.loading = false;
      },
    });
  }

  extractCategories() {
    const cats = this.products
      .map((p) => p.category)
      .filter((cat, index, arr) => cat && arr.indexOf(cat) === index);
    this.categories = cats as string[];
  }

  onSearch() {
    this.loadProducts();
  }

  onCategoryChange() {
    this.loadProducts();
  }

  deleteProduct(product: Product) {
    if (confirm(`¿Estás seguro de eliminar "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          alert('✅ Producto eliminado exitosamente');
          this.loadProducts();
        },
        error: (error: any) => {
          console.error('Error eliminando producto:', error);
          alert('❌ Error al eliminar el producto');
        },
      });
    }
  }

  canEdit(): boolean {
    return this.authService.isAdmin() || this.authService.isEmpleado();
  }
}
