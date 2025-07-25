import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import type { Product } from './product.service';

export interface Favorite {
  id: number;
  user_id: number;
  product_id: string;
  product: Product;
  created_at: string;
  updated_at: string;
}

export interface FavoriteResponse {
  success: boolean;
  message: string;
  data: Favorite[];
  count: number;
}

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private http: HttpClient = inject(HttpClient);
  private authService: AuthService = inject(AuthService);
  private apiUrl =
    'https://larabel-backend-navys-production.up.railway.app/api';

  /**
   * Obtener todos los favoritos del usuario
   */
  getFavorites(): Observable<FavoriteResponse> {
    return this.http.get<FavoriteResponse>(`${this.apiUrl}/favorites`, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  /**
   * Agregar un producto a favoritos
   */
  addToFavorites(productId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/favorites`,
      { product_id: productId },
      {
        headers: this.authService.getAuthHeaders(),
      }
    );
  }

  /**
   * Eliminar un producto de favoritos
   */
  removeFromFavorites(productId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/favorites/${productId}`, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  /**
   * Verificar si un producto está en favoritos
   */
  checkFavorite(
    productId: string
  ): Observable<{ success: boolean; is_favorite: boolean }> {
    return this.http.get<{ success: boolean; is_favorite: boolean }>(
      `${this.apiUrl}/favorites/check/${productId}`,
      {
        headers: this.authService.getAuthHeaders(),
      }
    );
  }

  /**
   * Obtener el conteo de favoritos
   */
  getFavoritesCount(): Observable<{ success: boolean; count: number }> {
    return this.http.get<{ success: boolean; count: number }>(
      `${this.apiUrl}/favorites/count`,
      {
        headers: this.authService.getAuthHeaders(),
      }
    );
  }

  /**
   * Toggle favorito - agregar si no existe, eliminar si existe
   */
  toggleFavorite(productId: string): Observable<any> {
    return new Observable((observer) => {
      this.checkFavorite(productId).subscribe({
        next: (response) => {
          if (response.is_favorite) {
            // Si está en favoritos, eliminarlo
            this.removeFromFavorites(productId).subscribe({
              next: (removeResponse) => {
                observer.next({ ...removeResponse, action: 'removed' });
                observer.complete();
              },
              error: (error) => observer.error(error),
            });
          } else {
            // Si no está en favoritos, agregarlo
            this.addToFavorites(productId).subscribe({
              next: (addResponse) => {
                observer.next({ ...addResponse, action: 'added' });
                observer.complete();
              },
              error: (error) => observer.error(error),
            });
          }
        },
        error: (error) => observer.error(error),
      });
    });
  }
}
