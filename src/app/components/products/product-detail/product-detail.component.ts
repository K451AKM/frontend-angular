import {
  Component,
  type OnInit,
  inject,
  HostListener,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService, type User } from '../../../services/auth.service';
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
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit {
  public authService = inject(AuthService);
  private productService = inject(ProductService);
  private favoriteService = inject(FavoriteService);
  private cartService = inject(CartService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  // State
  loading = true;
  cartCount = 0;
  selectedImageIndex = 0;
  selectedSize = '';
  selectedColor = '';
  selectedColorHex = '';
  quantity = 1;
  isUserMenuOpen = false;

  // Product states
  product: Product | null = null;
  productImages: string[] = [];
  isFavorite = false;
  favoriteLoading = false;
  cartLoading = false;

  // User data
  currentUser: User | null = null;

  // 🔥 Product options from DB
  availableSizes: string[] = [];
  availableColors: ColorOption[] = [];
  availableNumericSizes: number[] = [];

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUserData();

    // Suscribirse al conteo del carrito
    this.cartService.cartCount$.subscribe((count: number) => {
      this.cartCount = count;
    });

    // Obtener el ID del producto de la URL
    this.route.params.subscribe((params) => {
      const productId = params['id'];
      if (productId) {
        this.loadProduct(productId);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown')) {
      this.isUserMenuOpen = false;
    }
  }

  // Navigation Methods
  goBack(): void {
    window.history.back();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  // User Menu Methods
  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.currentUser = null;
        this.isUserMenuOpen = false;
        this.cartService.updateCartCount(0);
        this.router.navigate(['/']);
      },
      error: () => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.clear();
        }
        this.currentUser = null;
        this.isUserMenuOpen = false;
        this.cartService.updateCartCount(0);
        this.router.navigate(['/']);
      },
    });
  }

  // Product Methods
  loadProduct(productId: string): void {
    this.loading = true;

    // 🔥 NO usar mocks - solo datos reales de la API
    this.productService.getProductById(productId).subscribe({
      next: (response: any) => {
        console.log('🔥 Product data from API:', response.data); // Debug log
        this.product = response.data;
        this.processProductData();
        this.loadFavoriteStatus();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error cargando producto:', error);
        // 🔥 NO usar mocks - mostrar error
        this.loading = false;
        alert('❌ Error al cargar el producto');
        this.router.navigate(['/']);
      },
    });
  }

  // 🔥 Process product data from DB - CORREGIDO para manejar JSON strings
  processProductData(): void {
    if (!this.product) return;

    console.log('🔥 Processing product data:', this.product); // Debug log

    // 🔥 CORREGIDO: Process sizes from DB - manejar diferentes formatos
    if (this.product.sizes) {
      if (typeof this.product.sizes === 'string') {
        try {
          const parsedSizes = JSON.parse(this.product.sizes);
          this.availableSizes = Array.isArray(parsedSizes) ? parsedSizes : [];
        } catch (e) {
          console.error('🔥 Error parsing sizes:', e);
          this.availableSizes = [];
        }
      } else if (Array.isArray(this.product.sizes)) {
        this.availableSizes = this.product.sizes;
      }
    }

    if (this.product.size2) {
      if (typeof this.product.size2 === 'string') {
        try {
          const parsedSize2 = JSON.parse(this.product.size2);
          this.availableNumericSizes = Array.isArray(parsedSize2)
            ? parsedSize2
            : [];
        } catch (e) {
          console.error('🔥 Error parsing size2:', e);
          this.availableNumericSizes = [];
        }
      } else if (Array.isArray(this.product.size2)) {
        this.availableNumericSizes = this.product.size2;
      }
    }

    console.log('🔥 Available sizes:', this.availableSizes); // Debug log
    console.log('🔥 Available numeric sizes:', this.availableNumericSizes); // Debug log

    // 🔥 Process colors and images from DB
    this.processColorsAndImages();

    // Set default selections
    if (this.availableColors.length > 0) {
      this.selectColor(
        this.availableColors[0].name,
        this.availableColors[0].hex
      );
    }
    if (this.availableSizes.length > 0) {
      this.selectedSize = this.availableSizes[0];
    }
  }

  // 🔥 CORREGIDO: Process colors and images - SOLO datos reales de la DB
  processColorsAndImages(): void {
    if (!this.product?.images) {
      console.log('🔥 No images found in product'); // Debug log
      this.availableColors = [];
      this.productImages = [];
      return;
    }

    console.log('🔥 Raw images from DB:', this.product.images); // Debug log

    // 🔥 Handle different image formats
    let imagesObject: { [key: string]: string } = {};

    if (typeof this.product.images === 'string') {
      try {
        imagesObject = JSON.parse(this.product.images);
      } catch (e) {
        console.error('🔥 Error parsing images JSON:', e);
        imagesObject = {};
      }
    } else if (typeof this.product.images === 'object') {
      imagesObject = this.product.images;
    }

    console.log('🔥 Processed images object:', imagesObject); // Debug log

    this.availableColors = [];
    this.productImages = [];

    // 🔥 SOLO procesar colores que realmente existen en la DB
    Object.keys(imagesObject).forEach((colorKey, index) => {
      const imageUrl = imagesObject[colorKey];
      console.log(`🔥 Processing color key: ${colorKey}, image: ${imageUrl}`); // Debug log

      // Solo procesar si hay una imagen válida
      if (!imageUrl || !imageUrl.trim()) {
        console.log(`🔥 Skipping empty image for color: ${colorKey}`);
        return;
      }

      // 🔥 CORREGIDO: Extract color info using the same logic as product-form
      const colorHex = this.extractColorFromKey(colorKey);
      const colorName = this.extractColorNameFromKey(colorKey);

      console.log(
        `🔥 Extracted from key "${colorKey}": hex="${colorHex}", name="${colorName}"`
      ); // Debug log

      if (colorHex && colorName) {
        const fullImageUrl = this.productService.getProductImageUrl(imageUrl);
        console.log(`🔥 Full image URL: ${fullImageUrl}`); // Debug log

        this.availableColors.push({
          name: colorName,
          hex: colorHex,
          imageUrl: fullImageUrl,
        });

        this.productImages.push(fullImageUrl);
      }
    });

    console.log('🔥 Final available colors:', this.availableColors); // Debug log
    console.log('🔥 Final product images:', this.productImages); // Debug log

    // 🔥 Si no hay colores reales, no agregar nada falso
    if (this.availableColors.length === 0) {
      console.log('🔥 No real colors found - leaving empty');
      this.productImages = [];
    }
  }

  // 🔥 COPIADO EXACTO del product-form.component.ts
  extractColorFromKey(key: string): string | null {
    const parts = key.split('_');
    if (parts.length > 0 && /^[0-9a-fA-F]{6}$/.test(parts[0])) {
      return `#${parts[0]}`;
    }
    return null;
  }

  // 🔥 COPIADO EXACTO del product-form.component.ts
  extractColorNameFromKey(key: string): string | null {
    const parts = key.split('_');
    return parts.length > 1
      ? parts.slice(1).join('_').replace(/_/g, ' ')
      : null;
  }

  loadFavoriteStatus(): void {
    if (!this.authService.isAuthenticated() || !this.product) return;

    this.favoriteService.checkFavorite(this.product.id).subscribe({
      next: (response) => {
        this.isFavorite = response.is_favorite;
      },
      error: () => {
        this.isFavorite = false;
      },
    });
  }

  // Image Gallery Methods
  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  previousImage(): void {
    this.selectedImageIndex =
      this.selectedImageIndex > 0
        ? this.selectedImageIndex - 1
        : this.productImages.length - 1;
  }

  nextImage(): void {
    this.selectedImageIndex =
      this.selectedImageIndex < this.productImages.length - 1
        ? this.selectedImageIndex + 1
        : 0;
  }

  // Product Options Methods
  selectSize(size: string): void {
    this.selectedSize = size;
  }

  // 🔥 Updated color selection with image change
  selectColor(colorName: string, colorHex: string): void {
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

  updateQuantity(change: number): void {
    const newQuantity = this.quantity + change;
    const maxQuantity = this.product?.quantity || 1;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      this.quantity = newQuantity;
    }
  }

  // Actions Methods
  toggleFavorite(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.product || this.favoriteLoading) return;

    this.favoriteLoading = true;

    this.favoriteService.toggleFavorite(this.product.id).subscribe({
      next: (response) => {
        if (response.action === 'added') {
          this.isFavorite = true;
          console.log('✅ Producto agregado a favoritos');
        } else {
          this.isFavorite = false;
          console.log('❌ Producto eliminado de favoritos');
        }
        this.favoriteLoading = false;
      },
      error: (error) => {
        console.error('Error al manejar favorito:', error);
        this.favoriteLoading = false;
      },
    });
  }

  // 🔥 Updated addToCart with color and size details
  addToCart(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.product || this.cartLoading) return;

    // Validate selections
    if (!this.selectedColor && this.availableColors.length > 0) {
      alert('❌ Por favor selecciona un color');
      return;
    }

    if (!this.selectedSize && this.availableSizes.length > 0) {
      alert('❌ Por favor selecciona una talla');
      return;
    }

    this.cartLoading = true;

    // 🔥 Create cart item with details
    const cartItem = {
      product_id: this.product.id,
      quantity: this.quantity,
      size: this.selectedSize || undefined,
      color: this.selectedColor || undefined,
    };

    this.cartService.addToCart(cartItem).subscribe({
      next: (response) => {
        console.log('🛒 Producto agregado al carrito con detalles:', {
          producto: this.product?.name,
          color: this.selectedColor,
          talla: this.selectedSize,
          cantidad: this.quantity,
        });
        this.cartLoading = false;

        // Show success message
        alert(
          `✅ ${this.product?.name} agregado al carrito\nColor: ${this.selectedColor}\nTalla: ${this.selectedSize}\nCantidad: ${this.quantity}`
        );

        // Reset quantity but keep selections
        this.quantity = 1;
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

  buyNow(): void {
    this.addToCart();
    // Navigate to cart or checkout
    // this.router.navigate(['/cart'])
  }

  shareProduct(): void {
    if (isPlatformBrowser(this.platformId) && navigator.share && this.product) {
      navigator.share({
        title: this.product.name,
        text: this.product.description,
        url: window.location.href,
      });
    }
  }

  // Helper methods for template
  getCategoryRoute(): string {
    if (!this.product?.category) return '';
    return '/' + this.product.category.toLowerCase().replace(' ', '-');
  }

  getDiscountPercentage(): number {
    if (!this.product?.publicPrice || !this.product?.price) return 0;
    const publicPrice = Number(this.product.publicPrice);
    const currentPrice = Number(this.product.price);
    if (publicPrice <= 0) return 0;
    return Math.round(((publicPrice - currentPrice) / publicPrice) * 100);
  }

  hasDiscount(): boolean {
    return (
      this.product?.publicPrice !== undefined &&
      this.product?.publicPrice !== this.product?.price &&
      Number(this.product?.publicPrice) > Number(this.product?.price)
    );
  }

  getStockQuantity(): number {
    return this.product?.quantity || 0;
  }

  isOutOfStock(): boolean {
    return this.getStockQuantity() <= 0;
  }

  hasStock(): boolean {
    return this.getStockQuantity() > 0;
  }

  // 🔥 Helper methods for template
  hasSizes(): boolean {
    return (
      this.availableSizes.length > 0 || this.availableNumericSizes.length > 0
    );
  }

  hasColors(): boolean {
    return this.availableColors.length > 0;
  }

  getAllSizes(): (string | number)[] {
    return [...this.availableSizes, ...this.availableNumericSizes];
  }
}
