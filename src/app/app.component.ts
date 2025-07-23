import { Component, inject, type OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { FooterComponent } from './components/shared/footer/footer.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FooterComponent],
  template: `
    <div class="app-container">
      <!-- Contenido principal -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer global - aparece en todas las páginas -->
      <app-footer></app-footer>
    </div>
  `,
  styles: [
    `
      .app-container {
        min-height: 100vh;
        background: #f9fafb;
        display: flex;
        flex-direction: column;
      }

      .main-content {
        flex: 1;
        min-height: calc(100vh - 200px); /* Ajusta según la altura del footer */
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        line-height: 1.6;
        color: #111827;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  title = 'product-manager';
  authService = inject(AuthService);
  router = inject(Router);
  platformId = inject(PLATFORM_ID);
  currentUrl = '';

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          this.currentUrl = event.url;
        });
    }
  }
}
