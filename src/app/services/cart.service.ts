import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import type { Product } from './product.service';

export interface CartItem {
  id: number;
  user_id: number;
  product_id: string;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  subtotal: number;
  product: Product;
  created_at: string;
  updated_at: string;
}

export interface CartResponse {
  success: boolean;
  message: string;
  data: {
    items: CartItem[];
    total: string;
    count: number;
  };
}

export interface AddToCartRequest {
  product_id: string;
  quantity: number;
  size?: string;
  color?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://127.0.0.1:8000/api';

  // Subject para mantener el conteo del carrito actualizado
  private cartCountSubject = new BehaviorSubject<number>(0);
  public cartCount$ = this.cartCountSubject.asObservable();

  constructor() {
    // Cargar el conteo inicial si el usuario está autenticado
    if (this.authService.isAuthenticated()) {
      this.loadCartCount();
    }
  }

  /**
   * Obtener todos los items del carrito
   */
  getCart(): Observable<CartResponse> {
    return this.http.get<CartResponse>(`${this.apiUrl}/cart`, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  /**
   * Agregar un producto al carrito
   */
  addToCart(item: AddToCartRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/cart`, item, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  /**
   * Actualizar cantidad de un item del carrito
   */
  updateCartItem(itemId: number, quantity: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/cart/${itemId}`,
      { quantity },
      {
        headers: this.authService.getAuthHeaders(),
      }
    );
  }

  /**
   * Eliminar un item del carrito
   */
  removeFromCart(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cart/${itemId}`, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  /**
   * Limpiar todo el carrito
   */
  clearCart(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/cart`, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  /**
   * Obtener el conteo de items en el carrito
   */
  getCartCount(): Observable<{ success: boolean; count: number }> {
    return this.http.get<{ success: boolean; count: number }>(
      `${this.apiUrl}/cart/count`,
      {
        headers: this.authService.getAuthHeaders(),
      }
    );
  }

  /**
   * Cargar y actualizar el conteo del carrito
   */
  loadCartCount(): void {
    if (!this.authService.isAuthenticated()) {
      this.cartCountSubject.next(0);
      return;
    }

    this.getCartCount().subscribe({
      next: (response) => {
        if (response.success) {
          this.cartCountSubject.next(response.count);
        }
      },
      error: () => {
        this.cartCountSubject.next(0);
      },
    });
  }

  /**
   * Actualizar el conteo del carrito manualmente
   */
  updateCartCount(count: number): void {
    this.cartCountSubject.next(count);
  }

  /**
   * Obtener el conteo actual del carrito
   */
  getCurrentCartCount(): number {
    return this.cartCountSubject.value;
  }

  /**
   * Método helper para agregar producto con validaciones básicas
   */
  addProductToCart(
    product: Product,
    quantity = 1,
    size?: string,
    color?: string
  ): Observable<any> {
    const cartItem: AddToCartRequest = {
      product_id: product.id,
      quantity,
      size,
      color,
    };

    return new Observable((observer) => {
      this.addToCart(cartItem).subscribe({
        next: (response) => {
          // Actualizar el conteo del carrito
          this.loadCartCount();
          observer.next(response);
          observer.complete();
        },
        error: (error) => observer.error(error),
      });
    });
  }
}
