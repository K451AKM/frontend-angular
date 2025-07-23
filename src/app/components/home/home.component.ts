import { Component, type OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProductService, type Product } from '../../services/product.service';
import { FavoriteService } from '../../services/favorite.service';
import { CartService } from '../../services/cart.service';
import { ProductCardComponent } from '../shared/product-card/product-card.component';
import { HeaderComponent } from '../shared/header/header.component';

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
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  public authService = inject(AuthService);
  private productService = inject(ProductService);
  private favoriteService = inject(FavoriteService);
  private cartService = inject(CartService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // 🔥 CARRUSEL INDEPENDIENTE
  currentSlide = 0;
  slides = [
    {
      id: 'slide1',
      image: 'https://navys-5eeb9.web.app/img/imagenesinicio/principal.jpg',
      title: 'XV Años',
      subtitle:
        'Haz de tus quince un evento inolvidable con nuestros vestidos y accesorios.',
      category: 'xv-anos',
    },
    {
      id: 'slide2',
      image:
        'https://navys-5eeb9.web.app/img/imagenesinicio/xv%20carrucel%20damas.jpeg',
      title: 'Bautizos',
      subtitle: 'Elegancia atemporal para el día más especial de tu pequeño.',
      category: 'bautizos',
    },
  ];

  // State
  loading = true;
  productFavorites: { [productId: string]: boolean } = {};

  // Data
  featuredProducts: ProcessedProduct[] = [];

  ngOnInit(): void {
    this.loadFeaturedProducts();

    // 🔥 CARRUSEL INDEPENDIENTE
    if (isPlatformBrowser(this.platformId)) {
      this.startHeroSlider();
    }
  }

  // 🔥 CARRUSEL METHODS
  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  previousSlide(): void {
    this.currentSlide =
      this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
  }

  startHeroSlider(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    setInterval(() => {
      this.nextSlide();
    }, 8000);
  }

  exploreCategory(category: string): void {
    this.router.navigate([`/${category}`]);
  }

  // Products Methods
  loadFeaturedProducts(): void {
    this.loading = true;

    this.productService.getAllProducts().subscribe({
      next: (response: any) => {
        console.log('🔥 Raw products from API:', response.data?.data);
        const allProducts = response.data?.data || [];

        if (allProducts.length === 0) {
          console.log('🔥 No products found from API');
          this.featuredProducts = [];
          this.loading = false;
          return;
        }

        const rawProducts = allProducts.slice(0, 6);
        this.featuredProducts = rawProducts.map((product: Product) =>
          this.processProductData(product)
        );
        console.log('🔥 Processed featured products:', this.featuredProducts);
        this.loading = false;

        this.loadFavoritesStatus();
      },
      error: (error: any) => {
        console.error('Error cargando productos:', error);
        this.featuredProducts = [];
        this.loading = false;
      },
    });
  }

  processProductData(product: Product): ProcessedProduct {
    console.log('🔥 Processing product:', product.name, product);

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

    this.featuredProducts.forEach((product) => {
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
    const product = this.featuredProducts.find((p) => p.id === event.productId);
    console.log(`✅ ${product?.name} ${action} favoritos`);
  }

  onAddedToCart(product: Product): void {
    console.log('🛒 Producto agregado al carrito desde home:', product.name);
  }

  onProductClicked(product: Product): void {
    console.log('👁️ Ver producto:', product.name);
  }
}
