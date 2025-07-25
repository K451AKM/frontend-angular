import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import { AuthService, type User } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl =
    'https://larabel-backend-navys-production.up.railway.app/api';

  getAllUsers(page = 1): Observable<any> {
    return this.http.get(`${this.apiUrl}/users?page=${page}`, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  getUserById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${id}`, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  updateUser(
    id: number,
    userData: Partial<User>,
    photoFile?: File | null
  ): Observable<any> {
    const formData = new FormData();

    Object.keys(userData).forEach((key) => {
      const value = (userData as any)[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    if (photoFile) {
      formData.append('photo', photoFile);
    }

    return this.http.post(`${this.apiUrl}/users/${id}?_method=PUT`, formData, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  createUser(userData: any, photoFile?: File | null): Observable<any> {
    const formData = new FormData();

    Object.keys(userData).forEach((key) => {
      if (userData[key] !== null && userData[key] !== undefined) {
        formData.append(key, userData[key]);
      }
    });

    if (photoFile) {
      formData.append('photo', photoFile);
    }

    return this.http.post(`${this.apiUrl}/users`, formData, {
      headers: this.authService.getAuthHeaders(),
    });
  }
}
