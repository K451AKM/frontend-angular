import { Component, type OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  FavoriteService,
  type Favorite,
} from '../../services/favorite.service';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { HeaderComponent } from '../shared/header/header.component';
import { ProductCardComponent } from '../shared/product-card/product-card.component';

interface ColorOption {
  name: string;
  hex: string;
  imageUrl: string;
}

interface ProcessedFavorite extends Favorite {
  availableColors: ColorOption[];
  availableSizes: string[];
  availableNumericSizes: number[];
  productImages: string[];
}

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, ProductCardComponent],
  template: `
    <!-- 🔥 HEADER REUTILIZABLE -->
    <app-header></app-header>

    <!-- Hero Section para Favoritos -->
    <section class="favorites-hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-icon">
            <svg width="48" height="48" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </div>
          <h1 class="hero-title">Mis Favoritos</h1>
          <p class="hero-subtitle">
            Todos los productos que has marcado como favoritos
          </p>
          <div class="hero-stats" *ngIf="!loading">
            <div class="stat">
              <span class="stat-number">{{ favorites.length }}</span>
              <span class="stat-label">Productos Favoritos</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Favorites Content -->
    <section class="favorites-section">
      <div class="container">
        <!-- Loading -->
        <div class="loading-favorites" *ngIf="loading">
          <div class="loading-spinner"></div>
          <p>Cargando tus favoritos...</p>
        </div>

        <!-- Favorites Grid -->
        <div class="favorites-grid" *ngIf="!loading && favorites.length > 0">
          <app-product-card
            *ngFor="let favorite of favorites"
            [product]="favorite.product"
            [isFavorite]="true"
            [showSizes]="true"
            [showAddToCart]="true"
            cardSize="medium"
            [availableColors]="favorite.availableColors"
            [availableSizes]="favorite.availableSizes"
            [availableNumericSizes]="favorite.availableNumericSizes"
            [productImages]="favorite.productImages"
            (favoriteToggled)="onFavoriteToggled($event)"
            (addedToCart)="onAddedToCart($event)"
            (productClicked)="onProductClicked($event)"
          >
          </app-product-card>
        </div>

        <!-- Empty State -->
        <div class="empty-favorites" *ngIf="!loading && favorites.length === 0">
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
                  fill-rule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
            <h3 class="empty-title">No tienes favoritos aún</h3>
            <p class="empty-text">
              Explora nuestros productos y marca los que más te gusten como
              favoritos
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
  styleUrls: ['./favorites.component.css'],
})
export class FavoritesComponent implements OnInit {
  public authService = inject(AuthService);
  private favoriteService = inject(FavoriteService);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private router = inject(Router);

  loading = true;
  favorites: ProcessedFavorite[] = [];

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading = true;

    this.favoriteService.getFavorites().subscribe({
      next: (response) => {
        console.log('🔥 Favorites from API:', response.data);
        this.favorites = response.data.map((favorite) =>
          this.processFavoriteData(favorite)
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando favoritos:', error);
        this.favorites = [];
        this.loading = false;
      },
    });
  }

  processFavoriteData(favorite: Favorite): ProcessedFavorite {
    const processedFavorite: ProcessedFavorite = {
      ...favorite,
      availableColors: [],
      availableSizes: [],
      availableNumericSizes: [],
      productImages: [],
    };

    // Process sizes
    if (favorite.product.sizes) {
      if (typeof favorite.product.sizes === 'string') {
        try {
          const parsedSizes = JSON.parse(favorite.product.sizes);
          processedFavorite.availableSizes = Array.isArray(parsedSizes)
            ? parsedSizes
            : [];
        } catch (e) {
          processedFavorite.availableSizes = [];
        }
      } else if (Array.isArray(favorite.product.sizes)) {
        processedFavorite.availableSizes = favorite.product.sizes;
      }
    }

    if (favorite.product.size2) {
      if (typeof favorite.product.size2 === 'string') {
        try {
          const parsedSize2 = JSON.parse(favorite.product.size2);
          processedFavorite.availableNumericSizes = Array.isArray(parsedSize2)
            ? parsedSize2
            : [];
        } catch (e) {
          processedFavorite.availableNumericSizes = [];
        }
      } else if (Array.isArray(favorite.product.size2)) {
        processedFavorite.availableNumericSizes = favorite.product.size2;
      }
    }

    // Process colors and images
    this.processColorsAndImages(processedFavorite);

    return processedFavorite;
  }

  processColorsAndImages(favorite: ProcessedFavorite): void {
    if (!favorite.product.images) {
      favorite.availableColors = [];
      favorite.productImages = [];
      return;
    }

    let imagesObject: { [key: string]: string } = {};

    if (typeof favorite.product.images === 'string') {
      try {
        imagesObject = JSON.parse(favorite.product.images);
      } catch (e) {
        imagesObject = {};
      }
    } else if (typeof favorite.product.images === 'object') {
      imagesObject = favorite.product.images;
    }

    favorite.availableColors = [];
    favorite.productImages = [];

    Object.keys(imagesObject).forEach((colorKey) => {
      const imageUrl = imagesObject[colorKey];

      if (!imageUrl || !imageUrl.trim()) {
        return;
      }

      const colorHex = this.extractColorFromKey(colorKey);
      const colorName = this.extractColorNameFromKey(colorKey);

      if (colorHex && colorName) {
        const fullImageUrl = this.productService.getProductImageUrl(imageUrl);

        favorite.availableColors.push({
          name: colorName,
          hex: colorHex,
          imageUrl: fullImageUrl,
        });

        favorite.productImages.push(fullImageUrl);
      }
    });

    if (favorite.availableColors.length === 0) {
      favorite.productImages = [];
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

  // Event Handlers
  onFavoriteToggled(event: { productId: string; isFavorite: boolean }): void {
    if (!event.isFavorite) {
      // Remove from favorites list
      this.favorites = this.favorites.filter(
        (fav) => fav.product.id !== event.productId
      );
      console.log('✅ Producto eliminado de favoritos');
    }
  }

  onAddedToCart(product: any): void {
    console.log(
      '🛒 Producto agregado al carrito desde favoritos:',
      product.name
    );
  }

  onProductClicked(product: any): void {
    console.log('👁️ Ver producto desde favoritos:', product.name);
  }
}
