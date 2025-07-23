import { Component, inject, HostListener, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService, type User } from '../../../services/auth.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  public authService = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // State
  isUserMenuOpen = false;
  isSearchOpen = false;
  cartCount = 0;
  currentUser: User | null = null;

  constructor() {
    this.currentUser = this.authService.getCurrentUserData();

    // Suscribirse al conteo del carrito
    this.cartService.cartCount$.subscribe((count) => {
      this.cartCount = count;
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const target = event.target as HTMLElement;
    if (!target.closest('.user-dropdown')) {
      this.isUserMenuOpen = false;
    }
  }

  // Navigation Methods
  goHome(): void {
    this.router.navigate(['/']);
  }

  // User Menu Methods
  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  toggleSearch(): void {
    this.isSearchOpen = !this.isSearchOpen;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.currentUser = null;
        this.isUserMenuOpen = false;
        this.cartService.updateCartCount(0);
        this.router.navigate(['/']);
      },
      error: () => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.clear();
        }
        this.currentUser = null;
        this.isUserMenuOpen = false;
        this.cartService.updateCartCount(0);
        this.router.navigate(['/']);
      },
    });
  }

  // Navigation helpers
  navigateToCategory(category: string): void {
    this.router.navigate([`/${category}`]);
  }
}
