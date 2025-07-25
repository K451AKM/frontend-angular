import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_code: string;
  product_description?: string;
  product_image?: any;
  size?: string;
  color?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: number;
  order_number: string;
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled';
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  payment_method: 'cash' | 'card' | 'transfer' | 'paypal';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_reference?: string;
  payment_date?: string;
  notes?: string;
  admin_notes?: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: Order;
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: Order[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: any[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export interface CreateOrderRequest {
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country?: string;
  payment_method: 'cash' | 'card' | 'transfer' | 'paypal';
  notes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private apiUrl =
    'https://larabel-backend-navys-production.up.railway.app/api';

  /**
   * Obtener todos los pedidos del usuario
   */
  getOrders(page = 1, status?: string): Observable<OrdersResponse> {
    let url = `${this.apiUrl}/orders?page=${page}`;
    if (status) {
      url += `&status=${status}`;
    }

    return this.http.get<OrdersResponse>(url, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  // Verificar que el método getOrder esté correctamente implementado
  /**
   * Obtener un pedido específico con todos sus detalles
   */
  getOrder(id: string): Observable<OrderResponse> {
    console.log('🔥 OrderService.getOrder llamado con ID:', id);

    return this.http
      .get<OrderResponse>(`${this.apiUrl}/orders/${id}`, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        tap((response) => {
          console.log('🔥 Respuesta de getOrder:', response);
        }),
        catchError((error) => {
          console.error('🔥 Error en getOrder:', error);
          throw error;
        })
      );
  }

  /**
   * Crear un nuevo pedido desde el carrito
   */
  createOrder(orderData: CreateOrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.apiUrl}/orders`, orderData, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  /**
   * Cancelar un pedido
   */
  cancelOrder(id: string): Observable<OrderResponse> {
    return this.http.put<OrderResponse>(
      `${this.apiUrl}/orders/${id}/cancel`,
      {},
      {
        headers: this.authService.getAuthHeaders(),
      }
    );
  }

  /**
   * Procesar el checkout completo
   * Este método maneja todo el proceso de checkout y limpia el carrito
   */
  processCheckout(orderData: CreateOrderRequest): Observable<OrderResponse> {
    return new Observable((observer) => {
      this.createOrder(orderData).subscribe({
        next: (response) => {
          if (response.success) {
            // Actualizar el conteo del carrito a 0
            this.cartService.updateCartCount(0);
            observer.next(response);
            observer.complete();
          } else {
            observer.error(
              new Error(response.message || 'Error al procesar el pedido')
            );
          }
        },
        error: (error) => observer.error(error),
      });
    });
  }

  /**
   * Obtener el estado del pedido en formato legible
   */
  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      processing: 'En proceso',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };

    return statusMap[status] || status;
  }

  // 🔥 MÉTODOS PARA ADMIN - CORREGIDOS CON HEADERS DE AUTENTICACIÓN
  getAllOrdersAdmin(
    page = 1,
    status?: string,
    search?: string
  ): Observable<OrdersResponse> {
    let params = new HttpParams().set('page', page.toString());

    if (status && status !== 'all') {
      params = params.set('status', status);
    }

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    console.log('🔥 Haciendo petición a:', `${this.apiUrl}/admin/orders`);
    console.log('🔥 Con parámetros:', params.toString());

    return this.http.get<OrdersResponse>(`${this.apiUrl}/admin/orders`, {
      params,
      headers: this.authService.getAuthHeaders(),
    });
  }

  updateOrderStatus(
    orderId: string,
    status: string
  ): Observable<OrderResponse> {
    console.log('🔥 Actualizando estado del pedido:', orderId, 'a:', status);

    return this.http.put<OrderResponse>(
      `${this.apiUrl}/admin/orders/${orderId}/status`,
      {
        status: status,
      },
      {
        headers: this.authService.getAuthHeaders(),
      }
    );
  }

  /**
   * Obtener el estado del pago en formato legible
   */
  getPaymentStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'Pendiente',
      paid: 'Pagado',
      failed: 'Fallido',
      refunded: 'Reembolsado',
    };

    return statusMap[status] || status;
  }
}
