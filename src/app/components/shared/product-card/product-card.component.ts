import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import {
  ProductService,
  type Product,
} from '../../../services/product.service';
import { FavoriteService } from '../../../services/favorite.service';
import { CartService } from '../../../services/cart.service';

interface ColorOption {
  name: string;
  hex: string;
  imageUrl: string;
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() isFavorite = false;
  @Input() showSizes = true;
  @Input() showAddToCart = true;
  @Input() cardSize: 'small' | 'medium' | 'large' = 'medium';

  // 🔥 NUEVOS INPUTS para colores y datos procesados
  @Input() availableColors: ColorOption[] = [];
  @Input() availableSizes: string[] = [];
  @Input() availableNumericSizes: number[] = [];
  @Input() productImages: string[] = [];

  @Output() favoriteToggled = new EventEmitter<{
    productId: string;
    isFavorite: boolean;
  }>();
  @Output() addedToCart = new EventEmitter<Product>();
  @Output() productClicked = new EventEmitter<Product>();

  // Services
  private authService = inject(AuthService);
  private productService = inject(ProductService);
  private favoriteService = inject(FavoriteService);
  private cartService = inject(CartService);
  private router = inject(Router);

  // Loading states
  favoriteLoading = false;
  cartLoading = false;

  // 🔥 NUEVOS ESTADOS para selección
  selectedSize = '';
  selectedColor = '';
  selectedColorHex = '';
  selectedImageIndex = 0;

  // 🔥 Get all available sizes (string + numeric)
  get allAvailableSizes(): (string | number)[] {
    return [...this.availableSizes, ...this.availableNumericSizes];
  }

  // 🔥 Get current product image based on selection
  getCurrentProductImage(): string {
    if (
      this.productImages.length > 0 &&
      this.selectedImageIndex < this.productImages.length
    ) {
      return this.productImages[this.selectedImageIndex];
    }
    return this.getProductImage();
  }

  // Get product image (fallback)
  getProductImage(): string {
    return this.productService.getFirstProductImage(this.product);
  }

  // Handle image error
  onImageError(event: any): void {
    event.target.src = `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(
      this.product?.name || 'Producto'
    )}`;
  }

  // 🔥 NUEVA FUNCIÓN: Select color and change image
  selectColor(colorName: string, colorHex: string, event: Event): void {
    event.stopPropagation();
    console.log(`🔥 Selecting color: ${colorName} (${colorHex})`); // Debug log
    this.selectedColor = colorName;
    this.selectedColorHex = colorHex;

    // Find the color and change to its image
    const colorIndex = this.availableColors.findIndex(
      (color) => color.name === colorName
    );

    console.log(`🔥 Color index found: ${colorIndex}`); // Debug log

    if (colorIndex !== -1) {
      this.selectedImageIndex = colorIndex;
      console.log(`🔥 Changed to image index: ${this.selectedImageIndex}`); // Debug log
    }
  }

  // View product details
  viewProduct(): void {
    this.productClicked.emit(this.product);
    this.router.navigate(['/producto', this.product.id]);
  }

  // Toggle favorite
  toggleFavorite(event: Event): void {
    event.stopPropagation();

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.favoriteLoading) return;

    this.favoriteLoading = true;

    this.favoriteService.toggleFavorite(this.product.id).subscribe({
      next: (response) => {
        const newFavoriteState = response.action === 'added';
        this.favoriteToggled.emit({
          productId: this.product.id,
          isFavorite: newFavoriteState,
        });
        this.favoriteLoading = false;
      },
      error: (error) => {
        console.error('Error al manejar favorito:', error);
        this.favoriteLoading = false;
      },
    });
  }

  // Select size
  selectSize(size: string | number, event: Event): void {
    event.stopPropagation();
    this.selectedSize = size.toString();
  }

  // 🔥 ACTUALIZADO: Add to cart with color and size
  addToCart(event: Event): void {
    event.stopPropagation();

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.cartLoading) return;

    // Validate size selection if sizes are available
    if (this.allAvailableSizes.length > 0 && !this.selectedSize) {
      alert('❌ Por favor selecciona una talla');
      return;
    }

    // Validate color selection if colors are available
    if (this.availableColors.length > 0 && !this.selectedColor) {
      alert('❌ Por favor selecciona un color');
      return;
    }

    this.cartLoading = true;

    // 🔥 Create cart item with details
    const cartItem = {
      product_id: this.product.id,
      quantity: 1,
      size: this.selectedSize || undefined,
      color: this.selectedColor || undefined,
    };

    console.log('🔥 Adding to cart with details:', cartItem); // Debug log

    this.cartService.addToCart(cartItem).subscribe({
      next: (response) => {
        this.addedToCart.emit(this.product);
        this.cartLoading = false;

        // Show success message with details
        const sizeText = this.selectedSize
          ? ` - Talla: ${this.selectedSize}`
          : '';
        const colorText = this.selectedColor
          ? ` - Color: ${this.selectedColor}`
          : '';
        alert(
          `✅ ${this.product.name} agregado al carrito${colorText}${sizeText}`
        );
      },
      error: (error) => {
        console.error('Error al agregar al carrito:', error);
        if (error.error?.message) {
          alert(`❌ Error: ${error.error.message}`);
        } else {
          alert('❌ Error al agregar al carrito');
        }
        this.cartLoading = false;
      },
    });
  }

  // Check if product has discount
  hasDiscount(): boolean {
    return (
      this.product?.publicPrice !== undefined &&
      this.product?.publicPrice !== this.product?.price &&
      Number(this.product?.publicPrice) > Number(this.product?.price)
    );
  }

  // Get discount percentage
  getDiscountPercentage(): number {
    if (!this.hasDiscount()) return 0;
    const publicPrice = Number(this.product.publicPrice);
    const currentPrice = Number(this.product.price);
    return Math.round(((publicPrice - currentPrice) / publicPrice) * 100);
  }

  // Check stock status
  isOutOfStock(): boolean {
    return (this.product?.quantity || 0) <= 0;
  }

  // Get stock status text
  getStockStatus(): string {
    const quantity = this.product?.quantity || 0;
    if (quantity <= 0) return 'Sin stock';
    if (quantity <= 3) return `Últimas ${quantity} unidades`;
    return `${quantity} disponibles`;
  }
}
