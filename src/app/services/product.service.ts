import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Product {
  id: string;
  code: string;
  name: string;
  images: { [color: string]: string };
  sizes?: string[];
  size2?: number[];
  type?: string;
  price: string | number;
  category?: string;
  quantity?: number;
  description?: string;
  supplier?: string;
  purchasePrice?: number;
  publicPrice?: number;
  createdAt?: any;
  updatedAt?: any;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl =
    'https://larabel-backend-navys-production.up.railway.app/api';
  private baseUrl = 'https://larabel-backend-navys-production.up.railway.app';

  getAllProducts(filters?: any): Observable<any> {
    let url = `${this.apiUrl}/products`;

    if (filters) {
      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });
      url += `?${params.toString()}`;
    }

    return this.http.get(url);
  }

  getProductById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/${id}`);
  }

  createProduct(
    productData: Partial<Product>,
    images?: { [color: string]: File }
  ): Observable<any> {
    const formData = new FormData();

    Object.keys(productData).forEach((key) => {
      const value = (productData as any)[key];
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            formData.append(`${key}[${index}]`, item.toString());
          });
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    if (images) {
      Object.keys(images).forEach((color) => {
        formData.append(`images[${color}]`, images[color]);
      });
    }

    return this.http.post(`${this.apiUrl}/products`, formData, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  updateProduct(
    id: string,
    productData: Partial<Product>,
    images?: { [color: string]: File }
  ): Observable<any> {
    const formData = new FormData();

    Object.keys(productData).forEach((key) => {
      const value = (productData as any)[key];
      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            formData.append(`${key}[${index}]`, item.toString());
          });
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    if (images) {
      Object.keys(images).forEach((color) => {
        formData.append(`images[${color}]`, images[color]);
      });
    }

    return this.http.post(
      `${this.apiUrl}/products/${id}?_method=PUT`,
      formData,
      {
        headers: this.authService.getAuthHeaders(),
      }
    );
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${id}`, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  getProductImageUrl(imagePath?: string): string {
    if (!imagePath) {
      return '/placeholder.svg?height=250&width=300&text=Producto';
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    return `${this.baseUrl}/${imagePath}`;
  }

  getFirstProductImage(product: Product): string {
    if (product.images && typeof product.images === 'object') {
      const imageKeys = Object.keys(product.images);
      if (imageKeys.length > 0) {
        return this.getProductImageUrl(product.images[imageKeys[0]]);
      }
    }

    if (product.category?.toLowerCase().includes('xv')) {
      return '/placeholder.svg?height=250&width=300&text=XV+Años';
    } else if (product.category?.toLowerCase().includes('bautizo')) {
      return '/placeholder.svg?height=250&width=300&text=Bautizo';
    }

    return '/placeholder.svg?height=250&width=300&text=Producto';
  }
  getProductImages(product: Product): string[] {
    const processedImages: string[] = [];

    if (!product.images || typeof product.images !== 'object') {
      return [this.getFirstProductImage(product)];
    }

    const images = Object.values(product.images);

    images.forEach((imageUrl) => {
      if (typeof imageUrl === 'string' && imageUrl.trim()) {
        // Si la imagen ya tiene http/https, agregarla tal como está
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          processedImages.push(imageUrl);
        } else {
          // Si es una ruta relativa, construir la URL completa
          processedImages.push(
            `${this.apiUrl.replace('/api', '')}/${imageUrl}`
          );
        }
      }
    });

    // Si no hay imágenes válidas, devolver placeholder
    if (processedImages.length === 0) {
      processedImages.push(
        `/placeholder.svg?height=600&width=600&query=${encodeURIComponent(
          product.name
        )}`
      );
    }

    return processedImages;
  }
  createProductWithFormData(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/products`, formData, {
      headers: this.authService.getAuthHeaders(), // 🔥 Agregar headers
    });
  }

  updateProductWithFormData(id: string, formData: FormData): Observable<any> {
    // Laravel doesn't support PUT with FormData, so we use POST with _method
    formData.append('_method', 'PUT');
    return this.http.post(`${this.apiUrl}/products/${id}`, formData, {
      headers: this.authService.getAuthHeaders(), // 🔥 Agregar headers
    });
  }
}
