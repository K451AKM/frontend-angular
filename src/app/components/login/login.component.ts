import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = false;
  error = '';

  onSubmit() {
    if (!this.email || !this.password) {
      this.error = 'Por favor completa todos los campos';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('✅ Login exitoso:', response);
        this.loading = false;

        // Redirigir según el rol del usuario
        const user = response.data.user;
        if (user.role === 'admin' || user.role === 'empleado') {
          // Admin y empleados van al dashboard
          this.router.navigate(['/dashboard']);
        } else {
          // Clientes van al home
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        console.error('❌ Error en login:', error);
        this.error = error.error?.message || 'Error al iniciar sesión';
        this.loading = false;
      },
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
