import { Component, type OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService, type CartItem } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  template: `
    <!-- 🔥 HEADER REUTILIZABLE -->
    <app-header></app-header>

    <!-- Hero Section para Carrito -->
    <section class="cart-hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-icon">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
              ></path>
            </svg>
          </div>
          <h1 class="hero-title">Mi Carrito</h1>
          <p class="hero-subtitle">
            Revisa y gestiona los productos que deseas comprar
          </p>
          <div class="hero-stats" *ngIf="!loading">
            <div class="stat">
              <span class="stat-number">{{ cartItems.length }}</span>
              <span class="stat-label">Productos</span>
            </div>
            <div class="stat" *ngIf="cartItems.length > 0">
              <span class="stat-number">\${{ cartTotal }}</span>
              <span class="stat-label">Total</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Cart Content -->
    <section class="cart-section">
      <div class="container">
        <!-- Loading -->
        <div class="loading-cart" *ngIf="loading">
          <div class="loading-spinner"></div>
          <p>Cargando tu carrito...</p>
        </div>

        <!-- Cart Items -->
        <div class="cart-content" *ngIf="!loading && cartItems.length > 0">
          <div class="cart-items">
            <div class="cart-item" *ngFor="let item of cartItems">
              <div class="item-image">
                <img
                  [src]="getProductImage(item.product)"
                  [alt]="item.product.name"
                  (error)="onImageError($event)"
                />
              </div>

              <div class="item-details">
                <h3 class="item-name">{{ item.product.name }}</h3>
                <p class="item-code">Código: {{ item.product.code }}</p>
                <div class="item-options" *ngIf="item.color || item.size">
                  <span class="option" *ngIf="item.color">
                    <strong>Color:</strong> {{ item.color }}
                  </span>
                  <span class="option" *ngIf="item.size">
                    <strong>Talla:</strong> {{ item.size }}
                  </span>
                </div>
              </div>

              <div class="item-quantity">
                <button
                  class="qty-btn"
                  (click)="updateQuantity(item, item.quantity - 1)"
                  [disabled]="item.quantity <= 1 || updating"
                >
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </button>
                <span class="qty-number">{{ item.quantity }}</span>
                <button
                  class="qty-btn"
                  (click)="updateQuantity(item, item.quantity + 1)"
                  [disabled]="updating"
                >
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 010 2h-5v5a1 1 0 01-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </button>
              </div>

              <div class="item-price">
                <span class="price">\${{ item.price }}</span>
                <span class="subtotal">\${{ item.subtotal }}</span>
              </div>

              <div class="item-actions">
                <button
                  class="remove-btn"
                  (click)="removeItem(item)"
                  [disabled]="updating"
                  title="Eliminar producto"
                >
                  <svg
                    width="18"
                    height="18"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 102 0v3a1 1 0 11-2 0V9zm4 0a1 1 0 10-2 0v3a1 1 0 102 0V9z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Cart Summary -->
          <div class="cart-summary">
            <div class="summary-card">
              <h3 class="summary-title">Resumen del Pedido</h3>

              <div class="summary-line">
                <span>Subtotal ({{ cartItems.length }} productos)</span>
                <span>\${{ cartTotal }}</span>
              </div>

              <div class="summary-line">
                <span>Envío</span>
                <span class="free">Gratis</span>
              </div>

              <div class="summary-divider"></div>

              <div class="summary-total">
                <span>Total</span>
                <span>\${{ cartTotal }}</span>
              </div>

              <div class="summary-actions">
                <button class="checkout-btn" [disabled]="updating">
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
                  Proceder al Pago
                </button>

                <button class="continue-btn" routerLink="/">
                  Continuar Comprando
                </button>

                <button
                  class="clear-btn"
                  (click)="clearCart()"
                  [disabled]="updating"
                >
                  Vaciar Carrito
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty Cart -->
        <div class="empty-cart" *ngIf="!loading && cartItems.length === 0">
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
            <h3 class="empty-title">Tu carrito está vacío</h3>
            <p class="empty-text">
              Explora nuestros productos y agrega los que más te gusten al
              carrito
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
              <button routerLink="/xv-anos" class="category-btn">
                <span>👗</span>
                XV Años
              </button>
              <button routerLink="/bautizos" class="category-btn">
                <span>👶</span>
                Bautizos
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- WhatsApp Float Button -->
    <a
      href="https://wa.me/1234567890"
      class="whatsapp-float"
      target="_blank"
      rel="noopener"
    >
      <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
        <path
          d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.085"
        />
      </svg>
    </a>
  `,
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  public authService = inject(AuthService);
  private cartService = inject(CartService);
  private productService = inject(ProductService);
  private router = inject(Router);

  loading = true;
  updating = false;
  cartItems: CartItem[] = [];
  cartTotal = '0.00';

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;

    this.cartService.getCart().subscribe({
      next: (response) => {
        console.log('🔥 Cart from API:', response.data);
        this.cartItems = response.data.items || [];
        this.cartTotal = response.data.total || '0.00';
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando carrito:', error);
        this.cartItems = [];
        this.cartTotal = '0.00';
        this.loading = false;
      },
    });
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1 || this.updating) return;

    this.updating = true;

    this.cartService.updateCartItem(item.id, newQuantity).subscribe({
      next: () => {
        this.loadCart();
        this.updating = false;
        console.log('✅ Cantidad actualizada');
      },
      error: (error) => {
        console.error('Error actualizando cantidad:', error);
        this.updating = false;
        alert('❌ Error al actualizar la cantidad');
      },
    });
  }

  removeItem(item: CartItem): void {
    if (this.updating) return;

    const confirmRemove = confirm(
      `¿Estás seguro de que quieres eliminar "${item.product.name}" del carrito?`
    );

    if (confirmRemove) {
      this.updating = true;

      this.cartService.removeFromCart(item.id).subscribe({
        next: () => {
          this.loadCart();
          this.updating = false;
          console.log('✅ Producto eliminado del carrito');
        },
        error: (error) => {
          console.error('Error eliminando producto:', error);
          this.updating = false;
          alert('❌ Error al eliminar el producto');
        },
      });
    }
  }

  clearCart(): void {
    if (this.updating || this.cartItems.length === 0) return;

    const confirmClear = confirm(
      '¿Estás seguro de que quieres vaciar todo el carrito?'
    );

    if (confirmClear) {
      this.updating = true;

      this.cartService.clearCart().subscribe({
        next: () => {
          this.loadCart();
          this.updating = false;
          console.log('✅ Carrito vaciado');
        },
        error: (error) => {
          console.error('Error vaciando carrito:', error);
          this.updating = false;
          alert('❌ Error al vaciar el carrito');
        },
      });
    }
  }

  getProductImage(product: any): string {
    return this.productService.getFirstProductImage(product);
  }

  onImageError(event: any): void {
    event.target.src = '/placeholder.svg?height=100&width=100&text=Producto';
  }
}
