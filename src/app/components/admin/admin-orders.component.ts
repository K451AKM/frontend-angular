import { Component, type OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  OrderService,
  type Order,
  type OrderItem,
} from '../../services/order.service';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css'],
})
export class AdminOrdersComponent implements OnInit {
  private orderService = inject(OrderService);

  // Estado
  loading = true;
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  currentFilter = 'all';
  currentPage = 1;
  totalPages = 1;
  updatingOrder: string | null = null;
  searchTerm = '';

  // 🔥 NUEVOS ESTADOS PARA MODALES
  showViewModal = false;
  showEditModal = false;
  selectedOrder: Order | null = null;
  editingOrder: Order | null = null;
  savingChanges = false;

  // Estados disponibles para cambiar
  availableStatuses = [
    { value: 'pending', label: 'Pendiente', color: '#f59e0b' },
    { value: 'confirmed', label: 'Confirmado', color: '#3b82f6' },
    { value: 'processing', label: 'Procesando', color: '#8b5cf6' },
    { value: 'shipped', label: 'Enviado', color: '#10b981' },
    { value: 'delivered', label: 'Entregado', color: '#059669' },
    { value: 'cancelled', label: 'Cancelado', color: '#ef4444' },
  ];

  // Estados de pago disponibles
  availablePaymentStatuses = [
    { value: 'pending', label: 'Pendiente', color: '#f59e0b' },
    { value: 'paid', label: 'Pagado', color: '#10b981' },
    { value: 'failed', label: 'Fallido', color: '#ef4444' },
    { value: 'refunded', label: 'Reembolsado', color: '#6b7280' },
  ];

  // Estadísticas
  stats = {
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(page = 1, status?: string, search?: string): void {
    this.loading = true;

    const filterStatus = status && status !== 'all' ? status : undefined;
    const searchTerm =
      search && search.trim() ? search.trim() : this.searchTerm;

    console.log('🔥 Cargando pedidos con:', { page, filterStatus, searchTerm });

    this.orderService
      .getAllOrdersAdmin(page, filterStatus, searchTerm)
      .subscribe({
        next: (response) => {
          console.log('🔥 Respuesta del servidor:', response);

          if (response.success && response.data) {
            this.orders = response.data.data || [];
            this.currentPage = response.data.current_page || 1;
            this.totalPages = response.data.last_page || 1;

            console.log('🔥 Pedidos cargados:', this.orders.length);

            this.calculateStats();
            this.applyFilters();
          } else {
            console.error('🔥 Respuesta sin éxito:', response);
            this.orders = [];
            this.filteredOrders = [];
          }

          this.loading = false;
        },
        error: (error) => {
          console.error('🔥 Error cargando pedidos:', error);
          this.orders = [];
          this.filteredOrders = [];
          this.loading = false;

          if (error.status === 401) {
            alert('❌ No tienes permisos para acceder a esta sección');
          } else if (error.status === 403) {
            alert(
              '❌ Acceso denegado. Solo administradores pueden ver esta sección'
            );
          } else if (error.status === 404) {
            alert(
              '❌ Ruta no encontrada. Verifica la configuración del servidor'
            );
          } else {
            alert('❌ Error al cargar los pedidos. Verifica tu conexión.');
          }
        },
      });
  }

  calculateStats(): void {
    this.stats = {
      total: this.orders.length,
      pending: this.orders.filter((o) => o.status === 'pending').length,
      confirmed: this.orders.filter((o) => o.status === 'confirmed').length,
      processing: this.orders.filter((o) => o.status === 'processing').length,
      shipped: this.orders.filter((o) => o.status === 'shipped').length,
      delivered: this.orders.filter((o) => o.status === 'delivered').length,
      cancelled: this.orders.filter((o) => o.status === 'cancelled').length,
    };

    console.log('🔥 Estadísticas calculadas:', this.stats);
  }

  filterOrders(filter: string): void {
    console.log('🔥 Filtrando por:', filter);
    this.currentFilter = filter;

    if (filter === 'all') {
      this.loadOrders(1, undefined, this.searchTerm);
    } else {
      this.loadOrders(1, filter, this.searchTerm);
    }
  }

  applyFilters(): void {
    this.filteredOrders = [...this.orders];
    console.log('🔥 Pedidos filtrados:', this.filteredOrders.length);
  }

  onSearchChange(): void {
    console.log('🔥 Búsqueda cambiada:', this.searchTerm);
    const filterStatus =
      this.currentFilter !== 'all' ? this.currentFilter : undefined;
    this.loadOrders(1, filterStatus, this.searchTerm);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;

    console.log('🔥 Cambiando a página:', page);
    const filterStatus =
      this.currentFilter !== 'all' ? this.currentFilter : undefined;
    this.loadOrders(page, filterStatus, this.searchTerm);
  }

  updateOrderStatus(orderId: string, newStatus: string): void {
    if (this.updatingOrder === orderId) return;

    const validStatuses = [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];
    if (!validStatuses.includes(newStatus)) {
      console.error('Estado inválido:', newStatus);
      return;
    }

    const confirmMessage = `¿Estás seguro de cambiar el estado del pedido a "${this.getStatusLabel(
      newStatus
    )}"?`;

    if (confirm(confirmMessage)) {
      this.updatingOrder = orderId;

      this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
        next: (response) => {
          console.log('🔥 Estado actualizado:', response);

          this.orders = this.orders.map((order) => {
            if (order.id === orderId) {
              return { ...order, status: newStatus as Order['status'] };
            }
            return order;
          });

          this.calculateStats();
          this.applyFilters();
          this.updatingOrder = null;

          console.log('✅ Estado del pedido actualizado');
        },
        error: (error) => {
          console.error('🔥 Error actualizando estado:', error);
          this.updatingOrder = null;
          alert('❌ Error al actualizar el estado del pedido');
        },
      });
    }
  }

  // 🔥 NUEVOS MÉTODOS PARA MODALES

  /**
   * Abrir modal para ver detalles del pedido
   */
  viewOrderDetails(order: Order): void {
    console.log('🔥 Viendo detalles del pedido:', order.id);
    console.log('🔥 Datos del pedido:', order);

    // Si el pedido no tiene items, intentamos cargar los detalles completos
    if (!order.items || order.items.length === 0) {
      console.log('🔥 Cargando detalles completos del pedido...');
      this.orderService.getOrder(order.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.selectedOrder = response.data;
            this.showViewModal = true;
            console.log('🔥 Detalles cargados:', this.selectedOrder);
          } else {
            console.error('🔥 Error en respuesta:', response);
            alert('❌ Error al cargar los detalles del pedido');
          }
        },
        error: (error) => {
          console.error('🔥 Error cargando detalles:', error);
          alert('❌ Error al cargar los detalles del pedido');
        },
      });
    } else {
      // Si ya tiene items, usar los datos actuales
      this.selectedOrder = order;
      this.showViewModal = true;
      console.log('🔥 Usando datos existentes:', this.selectedOrder);
    }
  }

  /**
   * Cerrar modal de detalles
   */
  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedOrder = null;
  }

  /**
   * Abrir modal para editar pedido
   */
  editOrder(order: Order): void {
    console.log('🔥 Editando pedido:', order.id);
    console.log('🔥 Datos del pedido:', order);

    // Si el pedido no tiene items, intentamos cargar los detalles completos
    if (!order.items || order.items.length === 0) {
      console.log('🔥 Cargando detalles completos para editar...');
      this.orderService.getOrder(order.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.editingOrder = { ...response.data };
            this.showEditModal = true;
            console.log('🔥 Detalles cargados para editar:', this.editingOrder);
          } else {
            console.error('🔥 Error en respuesta:', response);
            alert('❌ Error al cargar los detalles del pedido');
          }
        },
        error: (error) => {
          console.error('🔥 Error cargando detalles:', error);
          alert('❌ Error al cargar los detalles del pedido');
        },
      });
    } else {
      // Si ya tiene items, usar los datos actuales
      this.editingOrder = { ...order };
      this.showEditModal = true;
      console.log('🔥 Usando datos existentes para editar:', this.editingOrder);
    }
  }

  /**
   * Cerrar modal de edición
   */
  closeEditModal(): void {
    this.showEditModal = false;
    this.editingOrder = null;
    this.savingChanges = false;
  }

  /**
   * Guardar cambios del pedido editado
   */
  saveOrderChanges(): void {
    if (!this.editingOrder || this.savingChanges) return;

    console.log('🔥 Guardando cambios del pedido:', this.editingOrder.id);
    this.savingChanges = true;

    // Preparar datos para enviar
    const updateData = {
      status: this.editingOrder.status,
      payment_status: this.editingOrder.payment_status,
      admin_notes: this.editingOrder.admin_notes || '',
    };

    this.orderService
      .updateOrderStatus(this.editingOrder.id, this.editingOrder.status)
      .subscribe({
        next: (response) => {
          console.log('🔥 Pedido actualizado:', response);

          // Actualizar el pedido en la lista local
          this.orders = this.orders.map((order) => {
            if (order.id === this.editingOrder!.id) {
              return { ...order, ...this.editingOrder };
            }
            return order;
          });

          this.calculateStats();
          this.applyFilters();
          this.closeEditModal();

          alert('✅ Pedido actualizado exitosamente');
        },
        error: (error) => {
          console.error('🔥 Error actualizando pedido:', error);
          this.savingChanges = false;
          alert('❌ Error al actualizar el pedido');
        },
      });
  }

  getStatusLabel(status: string): string {
    return this.orderService.getStatusLabel(status);
  }

  getStatusColor(status: string): string {
    const statusObj = this.availableStatuses.find((s) => s.value === status);
    return statusObj?.color || '#6b7280';
  }

  getPaymentStatusLabel(status: string): string {
    return this.orderService.getPaymentStatusLabel(status);
  }

  getPaymentStatusColor(status: string): string {
    const statusObj = this.availablePaymentStatuses.find(
      (s) => s.value === status
    );
    return statusObj?.color || '#6b7280';
  }

  // 🔥 MÉTODOS HELPER para el template
  getOrderItemsSlice(items: OrderItem[] | undefined): OrderItem[] {
    if (!items) return [];
    return items.slice(0, 2);
  }

  hasMoreItems(items: OrderItem[] | undefined): boolean {
    return items ? items.length > 2 : false;
  }

  getMoreItemsCount(items: OrderItem[] | undefined): number {
    return items ? items.length - 2 : 0;
  }

  getItemImage(item: OrderItem): string {
    if (item.product_image && item.product_image.startsWith('http')) {
      return item.product_image;
    }

    if (item.product_image) {
      return `http://127.0.0.1:8000/${item.product_image}`;
    }

    return '/placeholder.svg?height=50&width=50';
  }

  getTotalOrderValue(order: Order): number {
    return Number(order.total) || 0;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  exportOrders(): void {
    console.log('Exportando pedidos...');
    alert('Funcionalidad de exportación en desarrollo');
  }

  onStatusChange(orderId: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      this.updateOrderStatus(orderId, target.value);
    }
  }

  // 🔥 MÉTODOS HELPER PARA MODALES

  /**
   * Calcular subtotal de items del pedido
   */
  calculateItemsSubtotal(items: OrderItem[] | undefined): number {
    if (!items) return 0;
    return items.reduce((sum, item) => sum + Number(item.total_price), 0);
  }

  /**
   * Obtener información de envío formateada
   */
  getShippingAddress(order: Order): string {
    return `${order.shipping_address}, ${order.shipping_city}, ${order.shipping_state} ${order.shipping_postal_code}, ${order.shipping_country}`;
  }

  /**
   * Verificar si el pedido puede ser editado
   */
  canEditOrder(order: Order): boolean {
    return !['delivered', 'cancelled'].includes(order.status);
  }

  /**
   * Convertir string a número y formatear con decimales
   */
  formatNumber(value: any, decimals = 2): string {
    return Number(value || 0).toFixed(decimals);
  }

  // Agregar método helper para verificar si los datos están completos
  isOrderDataComplete(order: Order | null): boolean {
    if (!order) {
      console.log('🔥 Order es null');
      return false;
    }

    const hasBasicData = !!(order.id && order.order_number && order.status);
    const hasCustomerData = !!(order.shipping_name && order.shipping_email);
    const hasItems = !!(order.items && order.items.length > 0);

    console.log('🔥 Verificando datos del pedido:', {
      hasBasicData,
      hasCustomerData,
      hasItems,
      itemsCount: order.items?.length || 0,
    });

    return hasBasicData && hasCustomerData;
  }
}
