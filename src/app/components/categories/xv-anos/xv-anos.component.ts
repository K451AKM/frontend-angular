import { Component, type OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import {
  ProductService,
  type Product,
} from '../../../services/product.service';
import { FavoriteService } from '../../../services/favorite.service';
import { CartService } from '../../../services/cart.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { HeaderComponent } from '../../shared/header/header.component';

interface ColorOption {
  name: string;
  hex: string;
  imageUrl: string;
}

interface ProcessedProduct extends Product {
  availableColors: ColorOption[];
  availableSizes: string[];
  availableNumericSizes: number[];
  productImages: string[];
}

@Component({
  selector: 'app-xv-anos',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent, HeaderComponent],
  template: `
    <!-- 🔥 HEADER REUTILIZABLE -->
    <app-header></app-header>

    <!-- Hero Section específico para XV Años -->
    <section class="hero hero-xv-anos">
      <div class="hero-bg">
        <img
          src="https://navys-5eeb9.web.app/img/imagenesinicio/principal.jpg"
          alt="XV Años"
          class="hero-image"
        />
        <div class="hero-overlay"></div>
      </div>
      <div class="hero-content">
        <h1 class="hero-title">XV Años</h1>
        <p class="hero-subtitle">
          Haz de tus quince un evento inolvidable con nuestros vestidos y
          accesorios únicos.
        </p>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-number">{{ xvAnosProducts.length }}</span>
            <span class="stat-label">Productos Disponibles</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Products Section -->
    <section class="products-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Colección XV Años</h2>
          <p class="section-subtitle">
            Vestidos y accesorios para hacer de tu celebración un momento único
          </p>
        </div>

        <!-- 🔥 NUEVA IMPLEMENTACIÓN: Usando ProductCardComponent -->
        <div
          class="products-grid"
          *ngIf="!loading && xvAnosProducts.length > 0"
        >
          <app-product-card
            *ngFor="let product of xvAnosProducts"
            [product]="product"
            [isFavorite]="productFavorites[product.id] || false"
            [showSizes]="true"
            [showAddToCart]="true"
            cardSize="medium"
            [availableColors]="product.availableColors"
            [availableSizes]="product.availableSizes"
            [availableNumericSizes]="product.availableNumericSizes"
            [productImages]="product.productImages"
            (favoriteToggled)="onFavoriteToggled($event)"
            (addedToCart)="onAddedToCart($event)"
            (productClicked)="onProductClicked($event)"
          >
          </app-product-card>
        </div>

        <!-- Loading -->
        <div class="loading-products" *ngIf="loading">
          <div class="loading-spinner"></div>
          <p>Cargando productos de XV Años...</p>
        </div>

        <!-- 🔥 Estado vacío cuando no hay productos -->
        <div
          class="empty-state"
          *ngIf="!loading && xvAnosProducts.length === 0"
        >
          <div class="empty-icon">👗</div>
          <h3>No hay productos disponibles</h3>
          <p>No se encontraron productos de XV Años en la base de datos.</p>
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
      <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
        <path
          d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.085"
        />
      </svg>
    </a>
  `,
  styleUrls: ['../../../components/home/home.component.css'],
})
export class XvAnosComponent implements OnInit {
  public authService = inject(AuthService);
  private productService = inject(ProductService);
  private favoriteService = inject(FavoriteService);
  private cartService = inject(CartService);
  private router = inject(Router);

  // 🔥 SIMPLIFICADO: Solo los estados necesarios para productos
  loading = true;
  productFavorites: { [productId: string]: boolean } = {};
  xvAnosProducts: ProcessedProduct[] = [];

  ngOnInit(): void {
    this.loadXvAnosProducts();
  }

  // 🔥 SOLO MÉTODOS DE PRODUCTOS - El header se maneja en HeaderComponent
  loadXvAnosProducts(): void {
    this.loading = true;

    this.productService.getAllProducts().subscribe({
      next: (response: any) => {
        console.log('🔥 Raw products from API:', response.data?.data);
        const allProducts = response.data?.data || [];

        if (allProducts.length === 0) {
          console.log('🔥 No products found from API');
          this.xvAnosProducts = [];
          this.loading = false;
          return;
        }

        // Filtrar productos que contengan "xv" o "XV" en la categoría
        const filteredProducts = allProducts.filter(
          (product: Product) =>
            product.category?.toLowerCase().includes('xv') ||
            product.category?.toLowerCase().includes('quince')
        );

        // Procesar productos filtrados
        this.xvAnosProducts = filteredProducts.map((product: Product) =>
          this.processProductData(product)
        );
        console.log('🔥 Processed XV Años products:', this.xvAnosProducts);
        this.loading = false;

        this.loadFavoritesStatus();
      },
      error: (error: any) => {
        console.error('Error cargando productos de XV Años:', error);
        this.xvAnosProducts = [];
        this.loading = false;
      },
    });
  }

  processProductData(product: Product): ProcessedProduct {
    console.log('🔥 Processing XV Años product:', product.name, product);

    const processedProduct: ProcessedProduct = {
      ...product,
      availableColors: [],
      availableSizes: [],
      availableNumericSizes: [],
      productImages: [],
    };

    if (product.sizes) {
      if (typeof product.sizes === 'string') {
        try {
          const parsedSizes = JSON.parse(product.sizes);
          processedProduct.availableSizes = Array.isArray(parsedSizes)
            ? parsedSizes
            : [];
        } catch (e) {
          console.error('🔥 Error parsing sizes:', e);
          processedProduct.availableSizes = [];
        }
      } else if (Array.isArray(product.sizes)) {
        processedProduct.availableSizes = product.sizes;
      }
    }

    if (product.size2) {
      if (typeof product.size2 === 'string') {
        try {
          const parsedSize2 = JSON.parse(product.size2);
          processedProduct.availableNumericSizes = Array.isArray(parsedSize2)
            ? parsedSize2
            : [];
        } catch (e) {
          console.error('🔥 Error parsing size2:', e);
          processedProduct.availableNumericSizes = [];
        }
      } else if (Array.isArray(product.size2)) {
        processedProduct.availableNumericSizes = product.size2;
      }
    }

    this.processColorsAndImages(processedProduct);

    return processedProduct;
  }

  processColorsAndImages(product: ProcessedProduct): void {
    if (!product.images) {
      product.availableColors = [];
      product.productImages = [];
      return;
    }

    let imagesObject: { [key: string]: string } = {};

    if (typeof product.images === 'string') {
      try {
        imagesObject = JSON.parse(product.images);
      } catch (e) {
        console.error('🔥 Error parsing images JSON:', e);
        imagesObject = {};
      }
    } else if (typeof product.images === 'object') {
      imagesObject = product.images;
    }

    product.availableColors = [];
    product.productImages = [];

    Object.keys(imagesObject).forEach((colorKey, index) => {
      const imageUrl = imagesObject[colorKey];

      if (!imageUrl || !imageUrl.trim()) {
        return;
      }

      const colorHex = this.extractColorFromKey(colorKey);
      const colorName = this.extractColorNameFromKey(colorKey);

      if (colorHex && colorName) {
        const fullImageUrl = this.productService.getProductImageUrl(imageUrl);

        product.availableColors.push({
          name: colorName,
          hex: colorHex,
          imageUrl: fullImageUrl,
        });

        product.productImages.push(fullImageUrl);
      }
    });

    if (product.availableColors.length === 0) {
      product.productImages = [];
    }
  }

  extractColorFromKey(key: string): string | null {
    const parts = key.split('_');
    if (parts.length > 0 && /^[0-9a-fA-F]{6}$/.test(parts[0])) {
      return `#${parts[0]}`;
    }
    return null;
  }

  extractColorNameFromKey(key: string): string | null {
    const parts = key.split('_');
    return parts.length > 1
      ? parts.slice(1).join('_').replace(/_/g, ' ')
      : null;
  }

  loadFavoritesStatus(): void {
    if (!this.authService.isAuthenticated()) return;

    this.xvAnosProducts.forEach((product) => {
      this.favoriteService.checkFavorite(product.id).subscribe({
        next: (response) => {
          this.productFavorites[product.id] = response.is_favorite;
        },
        error: () => {
          this.productFavorites[product.id] = false;
        },
      });
    });
  }

  // Event Handlers
  onFavoriteToggled(event: { productId: string; isFavorite: boolean }): void {
    this.productFavorites[event.productId] = event.isFavorite;
    const action = event.isFavorite ? 'agregado a' : 'eliminado de';
    const product = this.xvAnosProducts.find((p) => p.id === event.productId);
    console.log(`✅ ${product?.name} ${action} favoritos`);
  }

  onAddedToCart(product: Product): void {
    console.log('🛒 Producto agregado al carrito desde XV Años:', product.name);
  }

  onProductClicked(product: Product): void {
    console.log('👁️ Ver producto XV Años:', product.name);
  }
}
