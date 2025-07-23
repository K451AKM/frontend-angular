import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, type RegisterData } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Form data
  formData: RegisterData = {
    email: '',
    password: '',
    name: '',
    lastName: '',
    middleName: '',
    numberPhone: '',
    photoFile: null,
    role: 'cliente', // Siempre cliente como especificó el usuario
  };

  confirmPassword = '';
  acceptTerms = false;
  showPassword = false;

  // UI state
  loading = false;
  error = '';
  success = '';
  photoPreview: string | null = null;

  // Validation errors - Definir el tipo explícitamente
  errors: Record<string, string> = {};

  onSubmit() {
    this.clearMessages();

    if (!this.validateForm()) {
      return;
    }

    this.loading = true;

    this.authService.register(this.formData).subscribe({
      next: (response) => {
        console.log('✅ Registro exitoso:', response);
        this.success = '¡Cuenta creada exitosamente! Redirigiendo...';

        // Redirigir al home después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Error en registro:', error);
        this.handleRegistrationError(error);
        this.loading = false;
      },
    });
  }

  validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    // Validar campos requeridos
    if (!this.formData.name.trim()) {
      this.errors['name'] = 'El nombre es requerido';
      isValid = false;
    }

    if (!this.formData.lastName.trim()) {
      this.errors['lastName'] = 'El apellido paterno es requerido';
      isValid = false;
    }

    if (!this.formData.email.trim()) {
      this.errors['email'] = 'El email es requerido';
      isValid = false;
    } else if (!this.isValidEmail(this.formData.email)) {
      this.errors['email'] = 'El email no es válido';
      isValid = false;
    }

    if (!this.formData.password) {
      this.errors['password'] = 'La contraseña es requerida';
      isValid = false;
    } else if (this.formData.password.length < 6) {
      this.errors['password'] =
        'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    if (!this.confirmPassword) {
      this.errors['confirmPassword'] = 'Confirma tu contraseña';
      isValid = false;
    } else if (this.formData.password !== this.confirmPassword) {
      this.errors['confirmPassword'] = 'Las contraseñas no coinciden';
      isValid = false;
    }

    if (!this.acceptTerms) {
      this.error = 'Debes aceptar los términos y condiciones';
      isValid = false;
    }

    return isValid;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  handleRegistrationError(error: any) {
    if (error.error?.errors) {
      // Errores de validación del servidor
      const serverErrors = error.error.errors;
      Object.keys(serverErrors).forEach((key) => {
        this.errors[key] = serverErrors[key][0]; // Primer error de cada campo
      });
    } else {
      this.error = error.error?.message || 'Error al crear la cuenta';
    }
  }

  clearMessages() {
    this.error = '';
    this.success = '';
    this.errors = {};
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onPhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        this.error = 'Por favor selecciona una imagen válida';
        return;
      }

      // Validar tamaño (2MB máximo)
      if (file.size > 2 * 1024 * 1024) {
        this.error = 'La imagen debe ser menor a 2MB';
        return;
      }

      this.formData.photoFile = file;

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.photoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto() {
    this.formData.photoFile = null;
    this.photoPreview = null;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
