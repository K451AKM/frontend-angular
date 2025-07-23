import { Component, inject, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <!-- Left side - Menu button -->
          <div class="flex items-center space-x-4">
            <button
              (click)="toggleMenu()"
              class="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <!-- User Avatar and Welcome -->
            <div class="flex items-center space-x-3" *ngIf="currentUser">
              <div
                class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium text-sm"
              >
                {{ getInitials() }}
              </div>
              <div>
                <p class="text-gray-900 font-medium">
                  Bienvenido {{ currentUser.role | titlecase }}
                </p>
                <p class="text-gray-500 text-sm">{{ currentUser.name }}</p>
              </div>
            </div>
          </div>

          <!-- Right side - Action buttons -->
          <div class="flex items-center space-x-2">
            <button class="p-2 rounded-md text-gray-400 hover:text-gray-600">
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 17h5l-5 5v-5z"
                />
              </svg>
            </button>

            <button class="p-2 rounded-md text-gray-400 hover:text-gray-600">
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            <button
              (click)="logout()"
              class="p-2 rounded-md text-gray-400 hover:text-red-600"
              title="Cerrar sesión"
            >
              <svg
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile menu -->
        <div *ngIf="isMenuOpen" class="sm:hidden border-t border-gray-200 py-2">
          <div class="space-y-1">
            <a
              routerLink="/dashboard"
              (click)="toggleMenu()"
              class="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            >
              Dashboard
            </a>
            <a
              routerLink="/products"
              (click)="toggleMenu()"
              class="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            >
              Productos
            </a>
            <a
              routerLink="/products/new"
              (click)="toggleMenu()"
              class="block px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            >
              Nuevo Producto
            </a>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [
    `
      nav {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
      }
    `,
  ],
})
export class NavbarComponent implements OnInit {
  public authService = inject(AuthService);
  private router = inject(Router);

  isMenuOpen = false;
  currentUser: any = null;

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUserData();
    console.log('Current user:', this.currentUser);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  getInitials(): string {
    if (!this.currentUser?.name) return 'U';
    return this.currentUser.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
