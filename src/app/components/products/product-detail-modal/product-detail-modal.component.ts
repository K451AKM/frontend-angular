import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ProductService,
  type Product,
} from '../../../services/product.service';

@Component({
  selector: 'app-product-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="closeModal()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="header-info">
            <h2 class="modal-title">{{ product?.name }}</h2>
            <span class="product-code">{{ product?.code }}</span>
          </div>
          <button (click)="closeModal()" class="close-btn">
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
              />
            </svg>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="modal-content">
          <!-- Image Gallery -->
          <div class="image-section">
            <div class="main-image">
              <img
                [src]="currentImage"
                [alt]="product?.name"
                class="product-main-img"
                (error)="onImageError($event)"
              />
            </div>
            <div class="image-thumbnails" *ngIf="productImages.length > 1">
              <button
                *ngFor="let image of productImages; let i = index"
                (click)="selectImage(image)"
                class="thumbnail-btn"
                [class.active]="currentImage === image"
              >
                <img
                  [src]="image"
                  [alt]="'Imagen ' + (i + 1)"
                  class="thumbnail-img"
                />
              </button>
            </div>
          </div>

          <!-- Product Details -->
          <div class="details-section">
            <!-- Price Section -->
            <div class="price-section">
              <div class="main-price">
                <span class="price-label">Precio</span>
                <span class="price-value">\${{ product?.price }}</span>
              </div>
              <div
                class="price-grid"
                *ngIf="product?.purchasePrice || product?.publicPrice"
              >
                <div class="price-item" *ngIf="product?.purchasePrice">
                  <span class="price-label">Precio Compra</span>
                  <span class="price-value"
                    >\${{ product?.purchasePrice }}</span
                  >
                </div>
                <div class="price-item" *ngIf="product?.publicPrice">
                  <span class="price-label">Precio Público</span>
                  <span class="price-value">\${{ product?.publicPrice }}</span>
                </div>
              </div>
            </div>

            <!-- Category and Type -->
            <div
              class="category-section"
              *ngIf="product?.category || product?.type"
            >
              <div class="category-item" *ngIf="product?.category">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z"
                  />
                </svg>
                <span>{{ product?.category }}</span>
              </div>
              <div class="category-item" *ngIf="product?.type">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M5.5,7A1.5,1.5 0 0,1 4,5.5A1.5,1.5 0 0,1 5.5,4A1.5,1.5 0 0,1 7,5.5A1.5,1.5 0 0,1 5.5,7M21.41,11.58L12.41,2.58C12.05,2.22 11.55,2 11,2H4C2.89,2 2,2.89 2,4V11C2,11.55 2.22,12.05 2.59,12.41L11.58,21.41C11.95,21.78 12.45,22 13,22C13.55,22 14.05,21.78 14.41,21.41L21.41,14.41C21.78,14.05 22,13.55 22,13C22,12.45 21.78,11.95 21.41,11.58Z"
                  />
                </svg>
                <span>{{ product?.type }}</span>
              </div>
            </div>

            <!-- Stock Info -->
            <div class="stock-section" *ngIf="product?.quantity !== undefined">
              <div class="stock-item">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12,2A3,3 0 0,1 15,5V7H20A1,1 0 0,1 21,8V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V8A1,1 0 0,1 4,7H9V5A3,3 0 0,1 12,2M12,4A1,1 0 0,0 11,5V7H13V5A1,1 0 0,0 12,4Z"
                  />
                </svg>
                <span>Stock: </span>
                <span
                  class="stock-value"
                  [ngClass]="{
                    'stock-high': (product?.quantity || 0) > 10,
                    'stock-medium':
                      (product?.quantity || 0) > 0 &&
                      (product?.quantity || 0) <= 10,
                    'stock-low': (product?.quantity || 0) === 0
                  }"
                >
                  {{ product?.quantity || 0 }} unidades
                </span>
              </div>
            </div>

            <!-- Sizes -->
            <div
              class="sizes-section"
              *ngIf="
                (product?.sizes?.length ?? 0) > 0 ||
                (product?.size2?.length ?? 0) > 0
              "
            >
              <h4 class="section-title">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M21,16V14L18,15V13H16V15L13,14V16L16,17V19H18V17L21,16M9,12H15A1,1 0 0,1 16,13V21A1,1 0 0,1 15,22H9A1,1 0 0,1 8,21V13A1,1 0 0,1 9,12M10,14V20H14V14H10M12,2A1,1 0 0,1 13,3V4H15V6H13V7A1,1 0 0,1 12,8H9V10H7V8A2,2 0 0,1 9,6V4A2,2 0 0,1 11,2H12Z"
                  />
                </svg>
                Tallas Disponibles
              </h4>
              <div class="sizes-grid">
                <div
                  class="size-group"
                  *ngIf="(product?.sizes?.length ?? 0) > 0"
                >
                  <span class="size-label">Tallas:</span>
                  <div class="size-tags">
                    <span
                      *ngFor="let size of product?.sizes"
                      class="size-tag"
                      >{{ size }}</span
                    >
                  </div>
                </div>
                <div
                  class="size-group"
                  *ngIf="(product?.size2?.length ?? 0) > 0"
                >
                  <span class="size-label">Medidas:</span>
                  <div class="size-tags">
                    <span
                      *ngFor="let size of product?.size2"
                      class="size-tag"
                      >{{ size }}</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- Supplier -->
            <div class="supplier-section" *ngIf="product?.supplier">
              <div class="supplier-item">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12,18.5A2.5,2.5 0 0,1 9.5,16A2.5,2.5 0 0,1 12,13.5A2.5,2.5 0 0,1 14.5,16A2.5,2.5 0 0,1 12,18.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22S19,14.25 19,9A7,7 0 0,0 12,2Z"
                  />
                </svg>
                <span>Proveedor: {{ product?.supplier }}</span>
              </div>
            </div>

            <!-- Description -->
            <div class="description-section" *ngIf="product?.description">
              <h4 class="section-title">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                  />
                </svg>
                Descripción
              </h4>
              <p class="description-text">{{ product?.description }}</p>
            </div>

            <!-- Colors Available -->
            <div class="colors-section" *ngIf="productColors.length > 0">
              <h4 class="section-title">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12H16A4,4 0 0,0 12,8V6Z"
                  />
                </svg>
                Colores Disponibles
              </h4>
              <div class="colors-grid">
                <div *ngFor="let color of productColors" class="color-item">
                  <div
                    class="color-preview"
                    [style.background-color]="color.hex"
                  ></div>
                  <span class="color-name">{{ color.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <button (click)="closeModal()" class="btn-secondary">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
              />
            </svg>
            Cerrar
          </button>
          <button (click)="editProduct()" class="btn-primary">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M3,17.25V21H6.75L17.81,9.94L14.06,6.19L3,17.25M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.13,5.12L18.88,8.87M20.71,7.04Z"
              />
            </svg>
            Editar Producto
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./product-detail-modal.component.css'],
})
export class ProductDetailModalComponent {
  @Input() product: Product | null = null;
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Product>();

  public productService = inject(ProductService);

  productImages: string[] = [];
  currentImage = '';
  productColors: { name: string; hex: string }[] = [];

  ngOnChanges() {
    if (this.product && this.isVisible) {
      this.loadProductImages();
      this.loadProductColors();
    }
  }

  loadProductImages() {
    if (this.product) {
      this.productImages = this.productService.getProductImages(this.product);
      this.currentImage = this.productImages[0] || '';
    }
  }

  loadProductColors() {
    this.productColors = [];
    if (this.product?.images && typeof this.product.images === 'object') {
      Object.keys(this.product.images).forEach((colorKey) => {
        const color = this.extractColorInfo(colorKey);
        if (color) {
          this.productColors.push(color);
        }
      });
    }
  }

  extractColorInfo(colorKey: string): { name: string; hex: string } | null {
    const parts = colorKey.split('_');
    if (parts.length > 0) {
      const hex = parts[0].startsWith('#') ? parts[0] : `#${parts[0]}`;
      const name =
        parts.length > 1
          ? parts.slice(1).join(' ').replace(/_/g, ' ')
          : 'Color';
      return { name, hex };
    }
    return null;
  }

  selectImage(image: string) {
    this.currentImage = image;
  }

  closeModal() {
    this.close.emit();
  }

  editProduct() {
    if (this.product) {
      this.edit.emit(this.product);
    }
  }

  onImageError(event: any) {
    event.target.src = '/placeholder.svg?height=400&width=400&text=Sin+Imagen';
  }
}
