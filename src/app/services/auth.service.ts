import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { type Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: number;
  email: string;
  name: string;
  lastName: string;
  middleName?: string;
  numberPhone?: string;
  photo?: string;
  role: 'admin' | 'empleado' | 'cliente';
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  lastName: string;
  middleName?: string;
  numberPhone?: string;
  photoFile?: File | null;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private apiUrl =
    'https://larabel-backend-navys-production.up.railway.app/api';
  private baseUrl = 'https://larabel-backend-navys-production.up.railway.app';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.checkStoredAuth();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, {
        email,
        password,
      })
      .pipe(
        tap((response) => {
          if (response.success && isPlatformBrowser(this.platformId)) {
            const user = this.processUserData(response.data.user);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
        }),
        catchError((error) => {
          console.error('Login error:', error);
          throw error;
        })
      );
  }

  register(userData: RegisterData): Observable<any> {
    const formData = new FormData();

    Object.keys(userData).forEach((key) => {
      const value = (userData as any)[key];
      if (value !== null && value !== undefined) {
        if (key === 'photoFile' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    return this.http.post(`${this.apiUrl}/register`, formData).pipe(
      tap((response: any) => {
        if (response.success && isPlatformBrowser(this.platformId)) {
          const user = this.processUserData(response.data.user);
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.http
      .post(
        `${this.apiUrl}/logout`,
        {},
        {
          headers: this.getAuthHeaders(),
        }
      )
      .pipe(
        tap(() => {
          this.clearAuth();
        }),
        catchError(() => {
          this.clearAuth();
          return of(null);
        })
      );
  }

  getCurrentUser(): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/me`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        tap((response: any) => {
          if (response.success) {
            const user = this.processUserData(response.data);
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem('user', JSON.stringify(user));
            }
            this.currentUserSubject.next(user);
          }
        })
      );
  }

  private processUserData(user: User): User {
    return {
      ...user,
      photo: this.getFullImageUrl(user.photo),
    };
  }

  getFullImageUrl(imagePath?: string): string {
    if (!imagePath) {
      return '/placeholder.svg?height=40&width=40&text=User';
    }

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    return `${this.baseUrl}/${imagePath}`;
  }

  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return !!localStorage.getItem('token');
  }

  isAdmin(): boolean {
    const user = this.getCurrentUserData();
    return user?.role === 'admin';
  }

  isEmpleado(): boolean {
    const user = this.getCurrentUserData();
    return user?.role === 'empleado';
  }

  isCliente(): boolean {
    const user = this.getCurrentUserData();
    return user?.role === 'cliente';
  }

  getAuthHeaders(): HttpHeaders {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = localStorage.getItem('token') || '';
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    });
  }

  getCurrentUserData(): User | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return {
        ...user,
        photo: this.getFullImageUrl(user.photo),
      };
    }
    return null;
  }

  private clearAuth(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
  }

  private checkStoredAuth(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      const processedUser = {
        ...user,
        photo: this.getFullImageUrl(user.photo),
      };
      this.currentUserSubject.next(processedUser);
    }
  }
}
