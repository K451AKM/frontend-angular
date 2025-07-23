import { Component, type OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  ProductService,
  type Product,
} from '../../../services/product.service';
import { LoadingComponent } from '../../shared/loading/loading.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  public productService = inject(ProductService);

  products: Product[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;

  filters = {
    search: '',
    category: '',
    type: '',
  };

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;

    const queryFilters: any = { page: this.currentPage };

    if (this.filters.search) queryFilters.search = this.filters.search;
    if (this.filters.category) queryFilters.category = this.filters.category;
    if (this.filters.type) queryFilters.type = this.filters.type;

    this.productService.getAllProducts(queryFilters).subscribe({
      next: (response) => {
        this.products = response.data.data || [];
        this.currentPage = response.data.current_page || 1;
        this.totalPages = response.data.last_page || 1;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando productos:', error);
        alert('Error al cargar los productos');
        this.loading = false;
      },
    });
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadProducts();
  }

  clearFilters() {
    this.filters = {
      search: '',
      category: '',
      type: '',
    };
    this.currentPage = 1;
    this.loadProducts();
  }

  hasFilters(): boolean {
    return !!(
      this.filters.search ||
      this.filters.category ||
      this.filters.type
    );
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  deleteProduct(product: Product) {
    const confirmDelete = confirm(
      `¿Estás seguro de que quieres eliminar el producto "${product.name}"?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmDelete) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          alert('Producto eliminado exitosamente');
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error eliminando producto:', error);
          alert('Error al eliminar el producto');
        },
      });
    }
  }

  onImageError(event: any) {
    event.target.src = '/placeholder.svg?height=200&width=300&text=Sin+Imagen';
  }
}
