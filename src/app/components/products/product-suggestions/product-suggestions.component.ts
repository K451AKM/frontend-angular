import {
  Component,
  Input,
  type OnChanges,
  type SimpleChanges,
  inject,
  type ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  ProductService,
  type Product,
} from '../../../services/product.service';
import { FavoriteService } from '../../../services/favorite.service';
import { AuthService } from '../../../services/auth.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';

interface ProcessedProduct extends Product {
  availableColors: { name: string; hex: string; imageUrl: string }[];
  availableSizes: string[];
  availableNumericSizes: number[];
  productImages: string[];
}

@Component({
  selector: 'app-product-suggestions',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './product-suggestions.component.html',
  styleUrls: ['./product-suggestions.component.css'],
})
export class ProductSuggestionsComponent implements OnChanges {
  @Input() category?: string;
  @Input() currentProductId?: string;
  @ViewChild('carousel') carousel!: ElementRef<HTMLDivElement>;

  private productService = inject(ProductService);
  private favoriteService = inject(FavoriteService);
  public authService = inject(AuthService);
  private router = inject(Router);

  loading = true;
  suggestedProducts: ProcessedProduct[] = [];
  productFavorites: { [productId: string]: boolean } = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['category'] && this.category) {
      this.loadSuggestedProducts();
    }
  }

  loadSuggestedProducts(): void {
    if (!this.category) return;
    this.loading = true;

    // 🔥 LÓGICA MEJORADA: Detectar la categoría principal (XV o Bautizo)
    const mainCategory = this.category.toLowerCase().startsWith('xv')
      ? 'xv'
      : 'bautizo';

    this.productService.getAllProducts().subscribe({
      next: (response: any) => {
        const allProducts = response.data?.data || [];

        const filtered = allProducts
          // 1. Filtrar por la misma categoría principal
          .filter((p: Product) =>
            p.category?.toLowerCase().startsWith(mainCategory)
          )
          // 2. Excluir el producto actual
          .filter((p: Product) => p.id !== this.currentProductId);

        this.suggestedProducts = filtered.map((p: Product) =>
          this.processProductData(p)
        );
        this.loadFavoritesStatus();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error cargando productos sugeridos:', err);
        this.loading = false;
      },
    });
  }

  processProductData(product: Product): ProcessedProduct {
    const processedProduct: ProcessedProduct = {
      ...product,
      availableColors: [],
      availableSizes: [],
      availableNumericSizes: [],
      productImages: [],
    };

    if (product.sizes) {
      try {
        processedProduct.availableSizes =
          typeof product.sizes === 'string'
            ? JSON.parse(product.sizes)
            : product.sizes;
      } catch {
        processedProduct.availableSizes = [];
      }
    }
    if (product.size2) {
      try {
        processedProduct.availableNumericSizes =
          typeof product.size2 === 'string'
            ? JSON.parse(product.size2)
            : product.size2;
      } catch {
        processedProduct.availableNumericSizes = [];
      }
    }

    let imagesObject: { [key: string]: string } = {};
    if (product.images) {
      try {
        imagesObject =
          typeof product.images === 'string'
            ? JSON.parse(product.images)
            : product.images;
      } catch {
        imagesObject = {};
      }
    }

    Object.keys(imagesObject).forEach((key) => {
      const imageUrl = imagesObject[key];
      if (imageUrl && imageUrl.trim()) {
        const colorHex = this.extractColorFromKey(key);
        const colorName = this.extractColorNameFromKey(key);
        if (colorHex && colorName) {
          const fullImageUrl = this.productService.getProductImageUrl(imageUrl);
          processedProduct.availableColors.push({
            name: colorName,
            hex: colorHex,
            imageUrl: fullImageUrl,
          });
          processedProduct.productImages.push(fullImageUrl);
        }
      }
    });

    if (processedProduct.productImages.length === 0) {
      processedProduct.productImages.push(
        this.productService.getFirstProductImage(product)
      );
    }

    return processedProduct;
  }

  extractColorFromKey = (key: string): string | null => {
    const parts = key.split('_');
    return parts.length > 0 && /^[0-9a-fA-F]{6}$/.test(parts[0])
      ? `#${parts[0]}`
      : null;
  };

  extractColorNameFromKey = (key: string): string | null => {
    const parts = key.split('_');
    return parts.length > 1
      ? parts.slice(1).join('_').replace(/_/g, ' ')
      : null;
  };

  loadFavoritesStatus(): void {
    if (!this.authService.isAuthenticated()) return;
    this.suggestedProducts.forEach((product) => {
      this.favoriteService.checkFavorite(product.id).subscribe({
        next: (res) => (this.productFavorites[product.id] = res.is_favorite),
        error: () => (this.productFavorites[product.id] = false),
      });
    });
  }

  onFavoriteToggled(event: { productId: string; isFavorite: boolean }): void {
    this.productFavorites[event.productId] = event.isFavorite;
  }

  onProductClicked(product: Product): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/producto', product.id]);
    });
  }

  scroll(direction: 'prev' | 'next'): void {
    const scrollAmount = this.carousel.nativeElement.clientWidth * 0.8;
    this.carousel.nativeElement.scrollBy({
      left: direction === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  }
}
