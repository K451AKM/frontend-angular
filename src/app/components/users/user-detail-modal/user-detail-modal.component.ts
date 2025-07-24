import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { User } from '../../../services/auth.service';

@Component({
  selector: 'app-user-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="closeModal()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="header-info">
            <h2 class="modal-title">Detalles del Usuario</h2>
            <span
              class="user-role-badge"
              [ngClass]="getRoleClass(user?.role || '')"
            >
              {{ user?.role | titlecase }}
            </span>
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
          <!-- User Avatar Section -->
          <div class="avatar-section">
            <div class="user-avatar-large">
              <img
                *ngIf="user?.photo; else avatarFallback"
                [src]="getFullImageUrl(user?.photo || '')"
                [alt]="user?.name"
                class="avatar-img-large"
              />
              <ng-template #avatarFallback>
                <div class="avatar-fallback-large">
                  {{ getInitials(user?.name || '', user?.lastName || '') }}
                </div>
              </ng-template>
            </div>
          </div>

          <!-- User Details -->
          <div class="details-section">
            <!-- Personal Information -->
            <div class="info-card">
              <h4 class="section-title">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"
                  />
                </svg>
                Información Personal
              </h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Nombre Completo:</span>
                  <span class="info-value">
                    {{ user?.name }} {{ user?.lastName }}
                    <span *ngIf="user?.middleName">
                      {{ user?.middleName }}</span
                    >
                  </span>
                </div>
                <div class="info-item">
                  <span class="info-label">Email:</span>
                  <span class="info-value">{{ user?.email }}</span>
                </div>
                <div class="info-item" *ngIf="user?.numberPhone">
                  <span class="info-label">Teléfono:</span>
                  <span class="info-value">{{ user?.numberPhone }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">ID de Usuario:</span>
                  <span class="info-value">#{{ user?.id }}</span>
                </div>
              </div>
            </div>

            <!-- Role Information -->
            <div class="info-card">
              <h4 class="section-title">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12,2A2,2 0 0,1 14,4C14,5.5 13.16,6.81 12,7.5C10.84,6.81 10,5.5 10,4A2,2 0 0,1 12,2M21,9V7L19,8V6A2,2 0 0,0 17,4H15C14.65,4.05 14.32,4.18 14.04,4.38L12,5.5L9.96,4.38C9.68,4.18 9.35,4.05 9,4H7A2,2 0 0,0 5,6V8L3,7V9L5,10V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V10L21,9Z"
                  />
                </svg>
                Información del Rol
              </h4>
              <div class="role-info">
                <div
                  class="role-badge-large"
                  [ngClass]="getRoleClass(user?.role || '')"
                >
                  <svg
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      *ngIf="user?.role === 'admin'"
                      d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C14.8,12.6 13.9,13.5 12.8,13.5H11.2C10.1,13.5 9.2,12.6 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,9.5V10.5C10.5,11.3 11.2,11.8 12,11.8C12.8,11.8 13.5,11.3 13.5,10.5V9.5C13.5,8.7 12.8,8.2 12,8.2Z"
                    />
                    <path
                      *ngIf="user?.role === 'empleado'"
                      d="M16,12A2,2 0 0,1 18,10A2,2 0 0,1 20,12A2,2 0 0,1 18,14A2,2 0 0,1 16,12M10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12M4,12A2,2 0 0,1 6,10A2,2 0 0,1 8,12A2,2 0 0,1 6,14A2,2 0 0,1 4,12Z"
                    />
                    <path
                      *ngIf="user?.role === 'cliente'"
                      d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"
                    />
                  </svg>
                  <div class="role-info-text">
                    <span class="role-name">{{ user?.role | titlecase }}</span>
                    <span class="role-description">{{
                      getRoleDescription(user?.role || '')
                    }}</span>
                  </div>
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
          <button (click)="editUser()" class="btn-primary">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M3,17.25V21H6.75L17.81,9.94L14.06,6.19L3,17.25M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.13,5.12L18.88,8.87M20.71,7.04Z"
              />
            </svg>
            Editar Usuario
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./user-detail-modal.component.css'],
})
export class UserDetailModalComponent {
  @Input() user: User | null = null;
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<User>();

  closeModal() {
    this.close.emit();
  }

  editUser() {
    if (this.user) {
      this.edit.emit(this.user);
    }
  }

  getFullImageUrl(photoPath: string): string {
    if (!photoPath) return '';
    if (photoPath.startsWith('http')) return photoPath;
    return `http://127.0.0.1:8000/${photoPath}`;
  }

  getInitials(name: string, lastName = ''): string {
    const initials = (name.charAt(0) + lastName.charAt(0)).toUpperCase();
    return initials || 'U';
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'admin':
        return 'role-admin';
      case 'empleado':
        return 'role-empleado';
      case 'cliente':
        return 'role-cliente';
      default:
        return 'role-cliente';
    }
  }

  getRoleDescription(role: string): string {
    switch (role) {
      case 'admin':
        return 'Acceso completo al sistema';
      case 'empleado':
        return 'Gestión de productos y clientes';
      case 'cliente':
        return 'Usuario del sistema';
      default:
        return 'Usuario del sistema';
    }
  }
}
