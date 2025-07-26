import { Component, type OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  FormBuilder,
  type FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CartService, type CartItem } from '../../services/cart.service';
import {
  OrderService,
  type CreateOrderRequest,
} from '../../services/order.service';
import { EmailService } from '../../services/email.service';
import { HeaderComponent } from '../shared/header/header.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HeaderComponent],
  template: `
    <!-- 🔥 HEADER REUTILIZABLE -->
    <app-header></app-header>

    <!-- Hero Section para Checkout -->
    <section class="checkout-hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-icon">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </div>
          <h1 class="hero-title">Finalizar Compra</h1>
          <p class="hero-subtitle">
            Completa tus datos para procesar tu pedido
          </p>
          <div class="hero-steps">
            <div class="step completed">
              <div class="step-number">1</div>
              <div class="step-label">Carrito</div>
            </div>
            <div class="step-line"></div>
            <div class="step active">
              <div class="step-number">2</div>
              <div class="step-label">Datos de Envío</div>
            </div>
            <div class="step-line"></div>
            <div class="step">
              <div class="step-number">3</div>
              <div class="step-label">Confirmación</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Checkout Content -->
    <section class="checkout-section">
      <div class="container">
        <!-- Loading -->
        <div class="loading-checkout" *ngIf="loading">
          <div class="loading-spinner"></div>
          <p>Cargando información...</p>
        </div>

        <!-- Error Message -->
        <div class="error-message" *ngIf="errorMessage">
          <div class="error-content">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              ></path>
            </svg>
            <p>{{ errorMessage }}</p>
          </div>
        </div>

        <!-- Success Message -->
        <div class="success-message" *ngIf="orderSuccess">
          <div class="success-content">
            <div class="success-icon">
              <svg
                width="64"
                height="64"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
            <h2 class="success-title">¡Pedido Realizado con Éxito!</h2>
            <p class="success-text">
              Tu número de pedido es: <strong>{{ orderNumber }}</strong>
            </p>
            <p class="success-info">
              Hemos enviado un correo electrónico con los detalles de tu compra.
            </p>

            <!-- 🔥 NUEVO: Indicador de email -->
            <div class="email-status" *ngIf="emailSent !== null">
              <div class="email-success" *ngIf="emailSent">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
                  ></path>
                  <path
                    d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"
                  ></path>
                </svg>
                <span>✅ Email de confirmación enviado correctamente</span>
              </div>
              <div class="email-error" *ngIf="!emailSent">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span
                  >⚠️ No se pudo enviar el email (pero tu pedido está
                  confirmado)</span
                >
              </div>
            </div>

            <p class="success-redirect">
              Serás redirigido a tus pedidos en unos segundos...
            </p>
            <div class="success-actions">
              <button routerLink="/orders" class="view-orders-btn">
                Ver Mis Pedidos
              </button>
              <button routerLink="/" class="continue-shopping-btn">
                Seguir Comprando
              </button>
            </div>
          </div>
        </div>

        <!-- Checkout Form -->
        <div class="checkout-content" *ngIf="!loading && !orderSuccess">
          <form
            [formGroup]="checkoutForm"
            (ngSubmit)="onSubmit()"
            class="checkout-form"
          >
            <div class="form-section">
              <h3 class="section-title">Información de Envío</h3>

              <div class="form-row">
                <div class="form-group">
                  <label for="shipping_name">Nombre Completo *</label>
                  <input
                    type="text"
                    id="shipping_name"
                    formControlName="shipping_name"
                    [class.is-invalid]="isFieldInvalid('shipping_name')"
                  />
                  <div
                    class="error-feedback"
                    *ngIf="isFieldInvalid('shipping_name')"
                  >
                    {{ getFieldError('shipping_name') }}
                  </div>
                </div>
              </div>

              <div class="form-row two-columns">
                <div class="form-group">
                  <label for="shipping_email">Correo Electrónico *</label>
                  <input
                    type="email"
                    id="shipping_email"
                    formControlName="shipping_email"
                    [class.is-invalid]="isFieldInvalid('shipping_email')"
                  />
                  <div
                    class="error-feedback"
                    *ngIf="isFieldInvalid('shipping_email')"
                  >
                    {{ getFieldError('shipping_email') }}
                  </div>
                </div>

                <div class="form-group">
                  <label for="shipping_phone">Teléfono *</label>
                  <input
                    type="tel"
                    id="shipping_phone"
                    formControlName="shipping_phone"
                    [class.is-invalid]="isFieldInvalid('shipping_phone')"
                  />
                  <div
                    class="error-feedback"
                    *ngIf="isFieldInvalid('shipping_phone')"
                  >
                    {{ getFieldError('shipping_phone') }}
                  </div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="shipping_address">Dirección *</label>
                  <input
                    type="text"
                    id="shipping_address"
                    formControlName="shipping_address"
                    [class.is-invalid]="isFieldInvalid('shipping_address')"
                    placeholder="Calle, número, colonia"
                  />
                  <div
                    class="error-feedback"
                    *ngIf="isFieldInvalid('shipping_address')"
                  >
                    {{ getFieldError('shipping_address') }}
                  </div>
                </div>
              </div>

              <div class="form-row three-columns">
                <div class="form-group">
                  <label for="shipping_city">Ciudad *</label>
                  <input
                    type="text"
                    id="shipping_city"
                    formControlName="shipping_city"
                    [class.is-invalid]="isFieldInvalid('shipping_city')"
                  />
                  <div
                    class="error-feedback"
                    *ngIf="isFieldInvalid('shipping_city')"
                  >
                    {{ getFieldError('shipping_city') }}
                  </div>
                </div>

                <div class="form-group">
                  <label for="shipping_state">Estado *</label>
                  <select
                    id="shipping_state"
                    formControlName="shipping_state"
                    [class.is-invalid]="isFieldInvalid('shipping_state')"
                  >
                    <option value="" disabled>Selecciona un estado</option>
                    <option *ngFor="let state of mexicoStates" [value]="state">
                      {{ state }}
                    </option>
                  </select>
                  <div
                    class="error-feedback"
                    *ngIf="isFieldInvalid('shipping_state')"
                  >
                    {{ getFieldError('shipping_state') }}
                  </div>
                </div>

                <div class="form-group">
                  <label for="shipping_postal_code">Código Postal *</label>
                  <input
                    type="text"
                    id="shipping_postal_code"
                    formControlName="shipping_postal_code"
                    [class.is-invalid]="isFieldInvalid('shipping_postal_code')"
                    maxlength="5"
                  />
                  <div
                    class="error-feedback"
                    *ngIf="isFieldInvalid('shipping_postal_code')"
                  >
                    {{ getFieldError('shipping_postal_code') }}
                  </div>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3 class="section-title">Método de Pago</h3>

              <div class="payment-methods">
                <div class="payment-method">
                  <input
                    type="radio"
                    id="payment_cash"
                    formControlName="payment_method"
                    value="cash"
                  />
                  <label for="payment_cash" class="payment-label">
                    <div class="payment-icon cash-icon">
                      <svg
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </div>
                    <div class="payment-info">
                      <span class="payment-name">Efectivo</span>
                      <span class="payment-description"
                        >Pago contra entrega</span
                      >
                    </div>
                  </label>
                </div>

                <div class="payment-method">
                  <input
                    type="radio"
                    id="payment_transfer"
                    formControlName="payment_method"
                    value="transfer"
                  />
                  <label for="payment_transfer" class="payment-label">
                    <div class="payment-icon transfer-icon">
                      <svg
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z"
                        ></path>
                      </svg>
                    </div>
                    <div class="payment-info">
                      <span class="payment-name">Transferencia Bancaria</span>
                      <span class="payment-description"
                        >Te enviaremos los datos bancarios</span
                      >
                    </div>
                  </label>
                </div>

                <div class="payment-method">
                  <input
                    type="radio"
                    id="payment_card"
                    formControlName="payment_method"
                    value="card"
                  />
                  <label for="payment_card" class="payment-label">
                    <div class="payment-icon card-icon">
                      <svg
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"
                        ></path>
                        <path
                          fill-rule="evenodd"
                          d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                          clip-rule="evenodd"
                        ></path>
                      </svg>
                    </div>
                    <div class="payment-info">
                      <span class="payment-name"
                        >Tarjeta de Crédito/Débito</span
                      >
                      <span class="payment-description"
                        >Pago seguro con tarjeta</span
                      >
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3 class="section-title">Notas Adicionales</h3>

              <div class="form-row">
                <div class="form-group">
                  <label for="notes">Instrucciones especiales (opcional)</label>
                  <textarea
                    id="notes"
                    formControlName="notes"
                    rows="3"
                    placeholder="Instrucciones para la entrega, referencias, etc."
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="form-section terms-section">
              <div class="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="terms_accepted"
                  formControlName="terms_accepted"
                  [class.is-invalid]="isFieldInvalid('terms_accepted')"
                />
                <label for="terms_accepted">
                  Acepto los
                  <a href="#" target="_blank">Términos y Condiciones</a> y la
                  <a href="#" target="_blank">Política de Privacidad</a>
                </label>
                <div
                  class="error-feedback"
                  *ngIf="isFieldInvalid('terms_accepted')"
                >
                  {{ getFieldError('terms_accepted') }}
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" routerLink="/cart" class="back-btn">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                Volver al Carrito
              </button>
              <button type="submit" class="submit-btn" [disabled]="submitting">
                <span *ngIf="!submitting">Confirmar Pedido</span>
                <span *ngIf="submitting" class="btn-spinner"></span>
              </button>
            </div>
          </form>

          <!-- Order Summary -->
          <div class="order-summary">
            <div class="summary-card">
              <h3 class="summary-title">Resumen del Pedido</h3>

              <div class="summary-items">
                <div class="summary-item" *ngFor="let item of cartItems">
                  <div class="item-image">
                    <img
                      [src]="getFirstImageFromProduct(item.product)"
                      [alt]="item.product.name"
                    />
                  </div>
                  <div class="item-info">
                    <h4 class="item-name">{{ item.product.name }}</h4>
                    <div class="item-details">
                      <span class="item-quantity">{{ item.quantity }} x</span>
                      <span class="item-price">\${{ item.price }}</span>
                    </div>
                    <div class="item-options" *ngIf="item.color || item.size">
                      <span *ngIf="item.color" class="item-color">{{
                        item.color
                      }}</span>
                      <span *ngIf="item.size" class="item-size">{{
                        item.size
                      }}</span>
                    </div>
                  </div>
                  <div class="item-subtotal">\${{ item.subtotal }}</div>
                </div>
              </div>

              <div class="summary-divider"></div>

              <div class="summary-line">
                <span>Subtotal</span>
                <span>\${{ cartTotal }}</span>
              </div>

              <div class="summary-line">
                <span>Envío</span>
                <span class="free">Gratis</span>
              </div>

              <div class="summary-total">
                <span>Total</span>
                <span>\${{ cartTotal }}</span>
              </div>

              <div class="summary-secure">
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span>Pago 100% Seguro</span>
              </div>
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
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  public authService = inject(AuthService);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private emailService = inject(EmailService);
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);

  // Estado
  loading = true;
  submitting = false;
  cartItems: CartItem[] = [];
  cartTotal = '0.00';
  checkoutForm!: FormGroup;
  currentUser: any;
  orderSuccess = false;
  orderNumber = '';
  errorMessage = '';
  emailSent: boolean | null = null; // 🔥 NUEVO: Estado del email

  // Estados de México para el select
  mexicoStates = [
    'Aguascalientes',
    'Baja California',
    'Baja California Sur',
    'Campeche',
    'Chiapas',
    'Chihuahua',
    'Coahuila',
    'Colima',
    'Ciudad de México',
    'Durango',
    'Estado de México',
    'Guanajuato',
    'Guerrero',
    'Hidalgo',
    'Jalisco',
    'Michoacán',
    'Morelos',
    'Nayarit',
    'Nuevo León',
    'Oaxaca',
    'Puebla',
    'Querétaro',
    'Quintana Roo',
    'San Luis Potosí',
    'Sinaloa',
    'Sonora',
    'Tabasco',
    'Tamaulipas',
    'Tlaxcala',
    'Veracruz',
    'Yucatán',
    'Zacatecas',
  ];

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/checkout' },
      });
      return;
    }

    this.currentUser = this.authService.getCurrentUserData();
    this.initForm();
    this.loadCart();
  }

  initForm(): void {
    this.checkoutForm = this.formBuilder.group({
      shipping_name: [
        this.currentUser?.name || '',
        [Validators.required, Validators.maxLength(255)],
      ],
      shipping_email: [
        this.currentUser?.email || '',
        [Validators.required, Validators.email, Validators.maxLength(255)],
      ],
      shipping_phone: ['', [Validators.required, Validators.maxLength(20)]],
      shipping_address: ['', [Validators.required, Validators.maxLength(255)]],
      shipping_city: ['', [Validators.required, Validators.maxLength(100)]],
      shipping_state: ['', [Validators.required]],
      shipping_postal_code: [
        '',
        [Validators.required, Validators.pattern(/^\d{5}$/)],
      ],
      payment_method: ['cash', [Validators.required]],
      notes: ['', [Validators.maxLength(1000)]],
      terms_accepted: [false, [Validators.requiredTrue]],
    });
  }

  loadCart(): void {
    this.loading = true;

    this.cartService.getCart().subscribe({
      next: (response) => {
        this.cartItems = response.data.items || [];
        this.cartTotal = response.data.total || '0.00';
        this.loading = false;

        // Si el carrito está vacío, redirigir al carrito
        if (this.cartItems.length === 0) {
          this.router.navigate(['/cart']);
        }
      },
      error: (error) => {
        console.error('Error cargando carrito:', error);
        this.cartItems = [];
        this.cartTotal = '0.00';
        this.loading = false;
        this.router.navigate(['/cart']);
      },
    });
  }

  onSubmit(): void {
    if (this.checkoutForm.invalid || this.submitting) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.checkoutForm.controls).forEach((key) => {
        const control = this.checkoutForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const orderData: CreateOrderRequest = {
      ...this.checkoutForm.value,
      shipping_country: 'México', // Por defecto México
    };

    // Eliminar el campo terms_accepted que no es parte del API
    delete (orderData as any).terms_accepted;

    this.orderService.processCheckout(orderData).subscribe({
      next: async (response) => {
        this.submitting = false;
        this.orderSuccess = true;
        this.orderNumber = response.data.order_number;

        // 🔥 NUEVO: Enviar email de confirmación
        await this.sendConfirmationEmail(response.data);

        // Esperar 5 segundos y redirigir a la página de pedidos
        setTimeout(() => {
          this.router.navigate(['/orders']);
        }, 5000);
      },
      error: (error) => {
        this.submitting = false;
        console.error('Error procesando pedido:', error);
        this.errorMessage =
          error.error?.message ||
          'Error al procesar el pedido. Por favor intenta nuevamente.';

        // Scroll al inicio para mostrar el error
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    });
  }

  // 🔥 NUEVO: Método para enviar email de confirmación
  private async sendConfirmationEmail(orderData: any): Promise<void> {
    try {
      const formValues = this.checkoutForm.value;

      const emailData = {
        customerName: formValues.shipping_name,
        customerEmail: formValues.shipping_email,
        orderNumber: orderData.order_number,
        orderTotal: this.cartTotal,
        orderItems: this.cartItems,
        shippingAddress: `${formValues.shipping_address}, ${formValues.shipping_city}, ${formValues.shipping_state}, ${formValues.shipping_postal_code}`,
        paymentMethod: formValues.payment_method,
      };

      console.log('📧 Preparando envío de email...', emailData);

      const emailResult = await this.emailService.sendOrderConfirmation(
        emailData
      );
      this.emailSent = emailResult;

      if (emailResult) {
        console.log('✅ Email enviado exitosamente');
      } else {
        console.log('❌ Error enviando email');
      }
    } catch (error) {
      console.error('❌ Error en sendConfirmationEmail:', error);
      this.emailSent = false;
    }
  }

  // Helpers para validación de formulario
  get f() {
    return this.checkoutForm.controls;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.checkoutForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getFieldError(field: string): string {
    const control = this.checkoutForm.get(field);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'Este campo es obligatorio';
    if (control.errors['email']) return 'Ingresa un correo electrónico válido';
    if (control.errors['maxlength'])
      return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
    if (control.errors['pattern']) {
      if (field === 'shipping_postal_code')
        return 'Ingresa un código postal válido (5 dígitos)';
      return 'Formato inválido';
    }
    if (control.errors['requiredTrue'])
      return 'Debes aceptar los términos y condiciones';

    return 'Campo inválido';
  }

  // Helper para obtener la primera imagen del producto
  getFirstImageFromProduct(product: any): string {
    if (product.images && typeof product.images === 'object') {
      const imageKeys = Object.keys(product.images);
      if (imageKeys.length > 0) {
        const firstImage = product.images[imageKeys[0]];
        if (firstImage && !firstImage.startsWith('http')) {
          return `https://larabel-backend-navys-production.up.railway.app/${firstImage}`;
        }
        return firstImage || '/placeholder.svg?height=60&width=60';
      }
    }
    return '/placeholder.svg?height=60&width=60';
  }
}
