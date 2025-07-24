import { Component, type OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  OrderService,
  type Order,
  type OrderItem,
} from '../../services/order.service';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  template: `
    <!-- 🔥 HEADER REUTILIZABLE -->
    <app-header></app-header>

    <!-- Hero Section para Pedidos -->
    <section class="orders-hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-icon">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
              ></path>
            </svg>
          </div>
          <h1 class="hero-title">Mis Pedidos</h1>
          <p class="hero-subtitle">
            Historial de tus compras y estado de tus pedidos
          </p>
        </div>
      </div>
    </section>

    <!-- Orders Content -->
    <section class="orders-section">
      <div class="container">
        <!-- Loading -->
        <div class="loading-orders" *ngIf="loading">
          <div class="loading-spinner"></div>
          <p>Cargando tus pedidos...</p>
        </div>

        <!-- Orders List -->
        <div class="orders-content" *ngIf="!loading && orders.length > 0">
          <div class="orders-filters">
            <button
              class="filter-btn"
              [class.active]="currentFilter === 'all'"
              (click)="filterOrders('all')"
            >
              Todos
            </button>
            <button
              class="filter-btn"
              [class.active]="currentFilter === 'pending'"
              (click)="filterOrders('pending')"
            >
              Pendientes
            </button>
            <button
              class="filter-btn"
              [class.active]="currentFilter === 'confirmed'"
              (click)="filterOrders('confirmed')"
            >
              Confirmados
            </button>
            <button
              class="filter-btn"
              [class.active]="currentFilter === 'delivered'"
              (click)="filterOrders('delivered')"
            >
              Entregados
            </button>
          </div>

          <div class="orders-list">
            <div class="order-card" *ngFor="let order of filteredOrders">
              <div class="order-header">
                <div class="order-info">
                  <h3 class="order-number">Pedido #{{ order.order_number }}</h3>
                  <span class="order-date">{{
                    order.created_at | date : 'dd/MM/yyyy'
                  }}</span>
                </div>
                <div class="order-status" [ngClass]="'status-' + order.status">
                  {{ getStatusLabel(order.status) }}
                </div>
              </div>

              <div class="order-items">
                <div
                  class="order-item"
                  *ngFor="let item of getOrderItemsSlice(order.items)"
                >
                  <div class="item-image">
                    <img [src]="getItemImage(item)" [alt]="item.product_name" />
                  </div>
                  <div class="item-details">
                    <h4 class="item-name">{{ item.product_name }}</h4>
                    <div class="item-meta">
                      <span class="item-quantity">{{ item.quantity }}x</span>
                      <span class="item-price">\${{ item.unit_price }}</span>
                      <span
                        *ngIf="item.color || item.size"
                        class="item-variations"
                      >
                        <span *ngIf="item.color">{{ item.color }}</span>
                        <span *ngIf="item.size">{{ item.size }}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div class="more-items" *ngIf="hasMoreItems(order.items)">
                  +{{ getMoreItemsCount(order.items) }} más
                </div>
              </div>

              <div class="order-footer">
                <div class="order-total">
                  <span>Total:</span>
                  <span class="total-amount">\${{ order.total }}</span>
                </div>
                <div class="order-actions">
                  <button class="view-btn" [routerLink]="['/orders', order.id]">
                    Ver Detalles
                  </button>
                  <button
                    *ngIf="canCancelOrder(order.status)"
                    class="cancel-btn"
                    (click)="cancelOrder(order.id)"
                    [disabled]="cancellingOrder === order.id"
                  >
                    <span *ngIf="cancellingOrder !== order.id">Cancelar</span>
                    <span
                      *ngIf="cancellingOrder === order.id"
                      class="btn-spinner"
                    ></span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div class="pagination" *ngIf="totalPages > 1">
            <button
              class="page-btn"
              [disabled]="currentPage === 1"
              (click)="changePage(currentPage - 1)"
            >
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </button>

            <span class="page-info"
              >Página {{ currentPage }} de {{ totalPages }}</span
            >

            <button
              class="page-btn"
              [disabled]="currentPage === totalPages"
              (click)="changePage(currentPage + 1)"
            >
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-orders" *ngIf="!loading && orders.length === 0">
          <div class="empty-content">
            <div class="empty-icon">
              <svg
                width="80"
                height="80"
                fill="currentColor"
                viewBox="0 0 20 20"
                opacity="0.3"
              >
                <path
                  d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                ></path>
              </svg>
            </div>
            <h3 class="empty-title">No tienes pedidos aún</h3>
            <p class="empty-text">
              Explora nuestros productos y realiza tu primera compra
            </p>
            <div class="empty-actions">
              <button routerLink="/" class="explore-btn">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                Explorar Productos
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./order-history.component.css'],
})
export class OrderHistoryComponent implements OnInit {
  private orderService = inject(OrderService);

  // Estado
  loading = true;
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  currentFilter = 'all';
  currentPage = 1;
  totalPages = 1;
  cancellingOrder: string | null = null;

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(page = 1, status?: string): void {
    this.loading = true;

    this.orderService.getOrders(page, status).subscribe({
      next: (response) => {
        this.orders = response.data.data;
        this.filteredOrders = [...this.orders];
        this.currentPage = response.data.current_page;
        this.totalPages = response.data.last_page;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando pedidos:', error);
        this.orders = [];
        this.filteredOrders = [];
        this.loading = false;
      },
    });
  }

  filterOrders(filter: string): void {
    this.currentFilter = filter;

    if (filter === 'all') {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(
        (order) => order.status === filter
      );
    }
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    const status =
      this.currentFilter !== 'all' ? this.currentFilter : undefined;
    this.loadOrders(page, status);
  }

  cancelOrder(orderId: string): void {
    if (confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
      this.cancellingOrder = orderId;

      this.orderService.cancelOrder(orderId).subscribe({
        next: () => {
          // Actualizar el estado del pedido en la lista
          this.orders = this.orders.map((order) => {
            if (order.id === orderId) {
              return { ...order, status: 'cancelled' };
            }
            return order;
          });

          // Aplicar filtro actual
          this.filterOrders(this.currentFilter);
          this.cancellingOrder = null;
        },
        error: (error) => {
          console.error('Error cancelando pedido:', error);
          this.cancellingOrder = null;
          alert('No se pudo cancelar el pedido. Por favor intenta nuevamente.');
        },
      });
    }
  }

  getStatusLabel(status: string): string {
    return this.orderService.getStatusLabel(status);
  }

  // 🔥 MÉTODOS HELPER para el template
  getOrderItemsSlice(items: OrderItem[] | undefined): OrderItem[] {
    if (!items) return [];
    return items.slice(0, 3);
  }

  hasMoreItems(items: OrderItem[] | undefined): boolean {
    return items ? items.length > 3 : false;
  }

  getMoreItemsCount(items: OrderItem[] | undefined): number {
    return items ? items.length - 3 : 0;
  }

  getItemImage(item: OrderItem): string {
    // Si ya tiene la URL completa, la devolvemos
    if (item.product_image && item.product_image.startsWith('http')) {
      return item.product_image;
    }

    // Si tiene imagen pero no es URL completa, construimos la URL del backend
    if (item.product_image) {
      return `http://127.0.0.1:8000/${item.product_image}`;
    }

    // Si no tiene imagen, devolvemos placeholder
    return '/placeholder.svg?height=60&width=60';
  }

  canCancelOrder(status: string): boolean {
    return status === 'pending' || status === 'confirmed';
  }
}
