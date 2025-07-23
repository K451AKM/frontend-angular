import { Component, type OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  type FormGroup,
  Validators,
} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { LoadingComponent } from '../../shared/loading/loading.component';

interface ColorImage {
  id: string;
  color: string;
  colorName: string;
  image: File | null;
  imagePreview: string | null;
  existingImageUrl?: string;
  // 🔥 Nuevo campo para saber si es imagen existente
  isExisting: boolean;
  originalColorKey?: string; // Para mantener la referencia original
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LoadingComponent,
    RouterModule,
  ],
  template: `
    <div class="form-container">
      <!-- Header -->
      <div class="form-header">
        <div class="header-content">
          <button (click)="goBack()" class="back-button">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
              />
            </svg>
            Volver
          </button>
          <div class="header-text">
            <h1 class="header-title">
              <svg
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  *ngIf="!isEditMode"
                />
                <path
                  d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                  *ngIf="isEditMode"
                />
              </svg>
              {{ isEditMode ? 'Editar Producto' : 'Nuevo Producto' }}
            </h1>
            <p class="header-subtitle">
              {{
                isEditMode
                  ? 'Actualiza la información del producto'
                  : 'Crea un nuevo producto con colores e imágenes específicas'
              }}
            </p>
          </div>
        </div>
      </div>

      <app-loading *ngIf="loading"></app-loading>

      <!-- Form -->
      <div *ngIf="!loading" class="form-content">
        <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
          <!-- Basic Information -->
          <div class="form-section">
            <div class="section-header">
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                />
              </svg>
              <h2>Información Básica</h2>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5.5,7A1.5,1.5 0 0,1 4,5.5A1.5,1.5 0 0,1 5.5,4A1.5,1.5 0 0,1 7,5.5A1.5,1.5 0 0,1 5.5,7M21.41,11.58L12.41,2.58C12.05,2.22 11.55,2 11,2H4C2.89,2 2,2.89 2,4V11C2,11.55 2.22,12.05 2.59,12.41L11.58,21.41C11.95,21.78 12.45,22 13,22C13.55,22 14.05,21.78 14.41,21.41L21.41,14.41C21.78,14.05 22,13.55 22,13C22,12.45 21.78,11.95 21.41,11.58Z"
                    />
                  </svg>
                  Código *
                </label>
                <input
                  type="text"
                  formControlName="code"
                  placeholder="PROD001"
                  class="form-input"
                  [class.error]="isFieldInvalid('code')"
                />
                <div *ngIf="isFieldInvalid('code')" class="form-error">
                  {{ getFieldError('code') }}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12,2A3,3 0 0,1 15,5V7H20A1,1 0 0,1 21,8V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V8A1,1 0 0,1 4,7H9V5A3,3 0 0,1 12,2M12,4A1,1 0 0,0 11,5V7H13V5A1,1 0 0,0 12,4Z"
                    />
                  </svg>
                  Nombre *
                </label>
                <input
                  type="text"
                  formControlName="name"
                  placeholder="Nombre del producto"
                  class="form-input"
                  [class.error]="isFieldInvalid('name')"
                />
                <div *ngIf="isFieldInvalid('name')" class="form-error">
                  {{ getFieldError('name') }}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"
                    />
                  </svg>
                  Categoría
                </label>
                <input
                  type="text"
                  formControlName="category"
                  placeholder="XV Años, Bautizos, etc."
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label class="form-label">
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5.5,7A1.5,1.5 0 0,1 4,5.5A1.5,1.5 0 0,1 5.5,4A1.5,1.5 0 0,1 7,5.5A1.5,1.5 0 0,1 5.5,7M21.41,11.58L12.41,2.58C12.05,2.22 11.55,2 11,2H4C2.89,2 2,2.89 2,4V11C2,11.55 2.22,12.05 2.59,12.41L11.58,21.41C11.95,21.78 12.45,22 13,22C13.55,22 14.05,21.78 14.41,21.41L21.41,14.41C21.78,14.05 22,13.55 22,13C22,12.45 21.78,11.95 21.41,11.58Z"
                    />
                  </svg>
                  Tipo
                </label>
                <input
                  type="text"
                  formControlName="type"
                  placeholder="Vestido, Traje, etc."
                  class="form-input"
                />
              </div>
            </div>
          </div>

          <!-- Pricing -->
          <div class="form-section">
            <div class="section-header">
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"
                />
              </svg>
              <h2>Precios</h2>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"
                    />
                  </svg>
                  Precio *
                </label>
                <input
                  type="number"
                  step="0.01"
                  formControlName="price"
                  placeholder="0.00"
                  class="form-input"
                  [class.error]="isFieldInvalid('price')"
                />
                <div *ngIf="isFieldInvalid('price')" class="form-error">
                  {{ getFieldError('price') }}
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5H5.21L4.27,3H1M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z"
                    />
                  </svg>
                  Precio Compra
                </label>
                <input
                  type="number"
                  step="0.01"
                  formControlName="purchasePrice"
                  placeholder="0.00"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label class="form-label">
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12,18.5A2.5,2.5 0 0,1 9.5,16A2.5,2.5 0 0,1 12,13.5A2.5,2.5 0 0,1 14.5,16A2.5,2.5 0 0,1 12,18.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22S19,14.25 19,9A7,7 0 0,0 12,2Z"
                    />
                  </svg>
                  Precio Público
                </label>
                <input
                  type="number"
                  step="0.01"
                  formControlName="publicPrice"
                  placeholder="0.00"
                  class="form-input"
                />
              </div>
            </div>
          </div>

          <!-- Colors and Images -->
          <div class="form-section">
            <div class="section-header">
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12H16A4,4 0 0,0 12,8V6Z"
                />
              </svg>
              <h2>Colores e Imágenes</h2>
              <p class="section-subtitle">
                Selecciona colores y sube una imagen específica para cada uno
              </p>
            </div>

            <!-- Add Color Button -->
            <div class="add-color-section">
              <button type="button" (click)="addColor()" class="add-color-btn">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                </svg>
                Agregar Color
              </button>
            </div>

            <!-- Color Items -->
            <div class="color-items" *ngIf="colorImages.length > 0">
              <div
                *ngFor="let colorItem of colorImages; let i = index"
                class="color-item"
              >
                <div class="color-item-header">
                  <div
                    class="color-preview"
                    [style.background-color]="colorItem.color"
                  ></div>
                  <div class="color-info">
                    <span class="color-name">{{
                      colorItem.colorName || 'Color ' + (i + 1)
                    }}</span>
                    <span class="color-hex">{{ colorItem.color }}</span>
                    <!-- 🔥 Indicador si es imagen existente -->
                    <span
                      class="color-status"
                      *ngIf="colorItem.isExisting && !colorItem.image"
                    >
                      📁 Imagen existente
                    </span>
                    <span class="color-status" *ngIf="colorItem.image">
                      🆕 Imagen nueva
                    </span>
                  </div>
                  <button
                    type="button"
                    (click)="removeColor(i)"
                    class="remove-color-btn"
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                      />
                    </svg>
                  </button>
                </div>

                <div class="color-controls">
                  <!-- Color Picker -->
                  <div class="color-picker-group">
                    <label class="color-picker-label">Color:</label>
                    <input
                      type="color"
                      [(ngModel)]="colorItem.color"
                      [ngModelOptions]="{ standalone: true }"
                      class="color-picker"
                    />
                  </div>

                  <!-- Color Name -->
                  <div class="color-name-group">
                    <label class="color-name-label">Nombre:</label>
                    <input
                      type="text"
                      [(ngModel)]="colorItem.colorName"
                      [ngModelOptions]="{ standalone: true }"
                      placeholder="Ej: Blanco, Negro, Rojo"
                      class="color-name-input"
                    />
                  </div>
                </div>

                <!-- Image Upload -->
                <div class="image-upload-area">
                  <div
                    *ngIf="
                      !colorItem.imagePreview && !colorItem.existingImageUrl
                    "
                    class="upload-placeholder"
                  >
                    <svg
                      width="48"
                      height="48"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z"
                      />
                    </svg>
                    <p>Sube una imagen para este color</p>
                    <input
                      type="file"
                      (change)="onImageSelected($event, i)"
                      accept="image/*"
                      class="file-input"
                      #fileInput
                    />
                    <button
                      type="button"
                      (click)="fileInput.click()"
                      class="upload-btn"
                    >
                      <svg
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                        />
                      </svg>
                      Seleccionar Imagen
                    </button>
                  </div>

                  <!-- Image Preview -->
                  <div
                    *ngIf="colorItem.imagePreview || colorItem.existingImageUrl"
                    class="image-preview"
                  >
                    <img
                      [src]="
                        colorItem.imagePreview || colorItem.existingImageUrl
                      "
                      [alt]="colorItem.colorName"
                      class="preview-image"
                    />
                    <div class="image-actions">
                      <input
                        type="file"
                        (change)="onImageSelected($event, i)"
                        accept="image/*"
                        class="file-input"
                        #changeFileInput
                      />
                      <button
                        type="button"
                        (click)="changeFileInput.click()"
                        class="change-image-btn"
                      >
                        <svg
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6Z"
                          />
                        </svg>
                        {{ colorItem.isExisting ? 'Cambiar' : 'Cambiar' }}
                      </button>
                      <button
                        type="button"
                        (click)="removeImage(i)"
                        class="remove-image-btn"
                      >
                        <svg
                          width="16"
                          height="16"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                          />
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div *ngIf="colorImages.length === 0" class="empty-colors">
              <svg
                width="64"
                height="64"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12H16A4,4 0 0,0 12,8V6Z"
                />
              </svg>
              <h3>Sin colores agregados</h3>
              <p>Agrega al menos un color con su imagen correspondiente</p>
            </div>
          </div>

          <!-- Sizes -->
          <div class="form-section">
            <div class="section-header">
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M21,16V14L18,15V13H16V15L13,14V16L16,17V19H18V17L21,16M9,12H15A1,1 0 0,1 16,13V21A1,1 0 0,1 15,22H9A1,1 0 0,1 8,21V13A1,1 0 0,1 9,12M10,14V20H14V14H10M12,2A1,1 0 0,1 13,3V4H15V6H13V7A1,1 0 0,1 12,8H9V10H7V8A2,2 0 0,1 9,6V4A2,2 0 0,1 11,2H12Z"
                />
              </svg>
              <h2>Tallas y Medidas</h2>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M21,16V14L18,15V13H16V15L13,14V16L16,17V19H18V17L21,16M9,12H15A1,1 0 0,1 16,13V21A1,1 0 0,1 15,22H9A1,1 0 0,1 8,21V13A1,1 0 0,1 9,12M10,14V20H14V14H10M12,2A1,1 0 0,1 13,3V4H15V6H13V7A1,1 0 0,1 12,8H9V10H7V8A2,2 0 0,1 9,6V4A2,2 0 0,1 11,2H12Z"
                    />
                  </svg>
                  Tallas
                </label>
                <input
                  type="text"
                  formControlName="sizes"
                  placeholder="XS, S, M, L, XL"
                  class="form-input"
                />
                <div class="form-help">Separar con comas</div>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M3,5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5C3.89,21 3,20.1 3,19V5M5,5V19H19V5H5M7,7H9V9H7V7M11,7H13V9H11V7M15,7H17V9H15V7Z"
                    />
                  </svg>
                  Medidas Numéricas
                </label>
                <input
                  type="text"
                  formControlName="size2"
                  placeholder="10, 12, 14, 16"
                  class="form-input"
                />
                <div class="form-help">Separar con comas</div>
              </div>
            </div>
          </div>

          <!-- Inventory -->
          <div class="form-section">
            <div class="section-header">
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12,18.5A2.5,2.5 0 0,1 9.5,16A2.5,2.5 0 0,1 12,13.5A2.5,2.5 0 0,1 14.5,16A2.5,2.5 0 0,1 12,18.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22S19,14.25 19,9A7,7 0 0,0 12,2Z"
                />
              </svg>
              <h2>Inventario</h2>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12,18.5A2.5,2.5 0 0,1 9.5,16A2.5,2.5 0 0,1 12,13.5A2.5,2.5 0 0,1 14.5,16A2.5,2.5 0 0,1 12,18.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22S19,14.25 19,9A7,7 0 0,0 12,2Z"
                    />
                  </svg>
                  Cantidad
                </label>
                <input
                  type="number"
                  formControlName="quantity"
                  placeholder="0"
                  class="form-input"
                />
              </div>

              <div class="form-group">
                <label class="form-label">
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12,18.5A2.5,2.5 0 0,1 9.5,16A2.5,2.5 0 0,1 12,13.5A2.5,2.5 0 0,1 14.5,16A2.5,2.5 0 0,1 12,18.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22S19,14.25 19,9A7,7 0 0,0 12,2Z"
                    />
                  </svg>
                  Proveedor
                </label>
                <input
                  type="text"
                  formControlName="supplier"
                  placeholder="Nombre del proveedor"
                  class="form-input"
                />
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="form-section">
            <div class="section-header">
              <svg
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"
                />
              </svg>
              <h2>Descripción</h2>
            </div>

            <textarea
              formControlName="description"
              rows="4"
              placeholder="Descripción detallada del producto..."
              class="form-textarea"
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button type="button" (click)="goBack()" class="btn-cancel">
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
                />
              </svg>
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="
                submitting || productForm.invalid || colorImages.length === 0
              "
              class="btn-submit"
            >
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 24 24"
                *ngIf="!submitting"
              >
                <path
                  d="M15,9H5V5H15M12.5,12.5L11,14L7.5,10.5L9,9L10.5,10.5L15,6L16.5,7.5M20,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.11,3 19,3H20Z"
                  *ngIf="!isEditMode"
                />
                <path
                  d="M3,17.25V21H6.75L17.81,9.94L14.06,6.19L3,17.25M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.13,5.12L18.88,8.87M20.71,7.04Z"
                  *ngIf="isEditMode"
                />
              </svg>
              <div class="loading-spinner" *ngIf="submitting"></div>
              <span *ngIf="submitting">Guardando...</span>
              <span *ngIf="!submitting">
                {{ isEditMode ? 'Actualizar' : 'Crear' }} Producto
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styleUrls: ['./product-form.component.css'],
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  public router = inject(Router);

  productForm: FormGroup;
  isEditMode = false;
  productId: string | null = null;
  loading = false;
  submitting = false;
  colorImages: ColorImage[] = [];

  constructor() {
    this.productForm = this.fb.group({
      code: ['', [Validators.required]],
      name: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0)]],
      category: [''],
      type: [''],
      quantity: [0, [Validators.min(0)]],
      description: [''],
      supplier: [''],
      purchasePrice: ['', [Validators.min(0)]],
      publicPrice: ['', [Validators.min(0)]],
      sizes: [''],
      size2: [''],
    });
  }

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.productId;

    if (this.isEditMode && this.productId) {
      this.loadProduct(this.productId);
    }
  }

  loadProduct(id: string) {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (response) => {
        const product = response.data;

        // 🔥 Load existing colors and images with proper tracking
        if (product.images && typeof product.images === 'object') {
          this.colorImages = Object.keys(product.images).map(
            (colorKey, index) => ({
              id: `existing_${index}`,
              color: this.extractColorFromKey(colorKey) || '#000000',
              colorName:
                this.extractColorNameFromKey(colorKey) || `Color ${index + 1}`,
              image: null, // No new image initially
              imagePreview: null,
              existingImageUrl: this.productService.getProductImageUrl(
                product.images[colorKey]
              ),
              isExisting: true, // 🔥 Mark as existing
              originalColorKey: colorKey, // 🔥 Keep original key reference
            })
          );
        }

        this.productForm.patchValue({
          code: product.code,
          name: product.name,
          price: product.price,
          category: product.category,
          type: product.type,
          quantity: product.quantity,
          description: product.description,
          supplier: product.supplier,
          purchasePrice: product.purchasePrice,
          publicPrice: product.publicPrice,
          sizes: Array.isArray(product.sizes)
            ? product.sizes.join(', ')
            : product.sizes,
          size2: Array.isArray(product.size2)
            ? product.size2.join(', ')
            : product.size2,
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando producto:', error);
        alert('❌ Error al cargar el producto');
        this.router.navigate(['/products']);
      },
    });
  }

  extractColorFromKey(key: string): string | null {
    const parts = key.split('_');
    if (parts.length > 0 && /^[0-9a-fA-F]{6}$/.test(parts[0])) {
      return `#${parts[0]}`;
    }
    return null;
  }

  extractColorNameFromKey(key: string): string | null {
    const parts = key.split('_');
    return parts.length > 1
      ? parts.slice(1).join('_').replace(/_/g, ' ')
      : null;
  }

  addColor() {
    const newColor: ColorImage = {
      id: `new_${Date.now()}`,
      color: '#000000',
      colorName: '',
      image: null,
      imagePreview: null,
      isExisting: false, // 🔥 Mark as new
    };
    this.colorImages.push(newColor);
  }

  removeColor(index: number) {
    this.colorImages.splice(index, 1);
  }

  onImageSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (
      file &&
      file.type.startsWith('image/') &&
      file.size <= 2 * 1024 * 1024
    ) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.colorImages[index].image = file;
        this.colorImages[index].imagePreview = e.target.result;
        // 🔥 When new image is selected, clear existing URL
        this.colorImages[index].existingImageUrl = undefined;
      };
      reader.readAsDataURL(file);
    } else {
      alert('❌ Solo se permiten imágenes menores a 2MB');
    }
  }

  removeImage(index: number) {
    this.colorImages[index].image = null;
    this.colorImages[index].imagePreview = null;
    // 🔥 If it was existing, restore the existing URL
    if (this.colorImages[index].isExisting) {
      // Don't restore - user wants to remove the image
      this.colorImages[index].existingImageUrl = undefined;
    }
  }

  goBack() {
    this.router.navigate(['/products']);
  }

  prepareBasicData(): any {
    const formValue = this.productForm.value;

    return {
      code: formValue.code,
      name: formValue.name,
      price: Number.parseFloat(formValue.price),
      category: formValue.category || undefined,
      type: formValue.type || undefined,
      quantity: Number.parseInt(formValue.quantity) || 0,
      description: formValue.description || undefined,
      supplier: formValue.supplier || undefined,
      purchasePrice: formValue.purchasePrice
        ? Number.parseFloat(formValue.purchasePrice)
        : undefined,
      publicPrice: formValue.publicPrice
        ? Number.parseFloat(formValue.publicPrice)
        : undefined,
      sizes: this.processSizesArray(formValue.sizes),
      size2: this.processNumericSizesArray(formValue.size2),
    };
  }

  processSizesArray(sizesString: string): string[] {
    if (!sizesString || sizesString.trim() === '') {
      return [];
    }
    return sizesString
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);
  }

  processNumericSizesArray(sizesString: string): number[] {
    if (!sizesString || sizesString.trim() === '') {
      return [];
    }
    return sizesString
      .split(',')
      .map((s: string) => Number.parseInt(s.trim()))
      .filter((n: number) => !isNaN(n));
  }

  onSubmit() {
    if (this.productForm.valid && this.colorImages.length > 0) {
      this.submitting = true;

      const formData = new FormData();
      const basicData = this.prepareBasicData();

      // Add basic data
      Object.keys(basicData).forEach((key) => {
        const value = basicData[key];
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((item, index) => {
              formData.append(`${key}[${index}]`, item.toString());
            });
          } else {
            formData.append(key, value.toString());
          }
        }
      });

      // 🔥 Handle images intelligently
      this.colorImages.forEach((colorItem, index) => {
        const safeColorHex = colorItem.color.replace('#', '');
        const safeColorName = (colorItem.colorName || `color_${index}`)
          .replace(/[^a-zA-Z0-9]/g, '_')
          .toLowerCase();
        const colorKey = `${safeColorHex}_${safeColorName}`;

        if (colorItem.image) {
          // 🔥 New image - send the file
          formData.append(`images[${colorKey}]`, colorItem.image);
        } else if (
          colorItem.isExisting &&
          colorItem.existingImageUrl &&
          colorItem.originalColorKey
        ) {
          // 🔥 Existing image to keep - send a flag
          formData.append(
            `keep_images[${colorKey}]`,
            colorItem.originalColorKey
          );
        }
      });

      // 🔥 Debug: Ver qué se está enviando
      console.log('🔥 FormData contents:');
      formData.forEach((value, key) => {
        console.log(key + ': ' + value);
      });

      const request =
        this.isEditMode && this.productId
          ? this.productService.updateProductWithFormData(
              this.productId,
              formData
            )
          : this.productService.createProductWithFormData(formData);

      request.subscribe({
        next: (response: any) => {
          const action = this.isEditMode ? 'actualizado' : 'creado';
          alert(`✅ Producto ${action} exitosamente`);
          this.router.navigate(['/products']);
        },
        error: (error: any) => {
          console.error('Error guardando producto:', error);
          console.error('Error details:', error.error);

          if (error.error?.errors) {
            const errors = error.error.errors;
            let errorMessage = 'Errores de validación:\n';

            Object.keys(errors).forEach((field) => {
              errorMessage += `• ${field}: ${errors[field].join(', ')}\n`;
            });

            alert(`❌ ${errorMessage}`);
          } else {
            const action = this.isEditMode ? 'actualizar' : 'crear';
            alert(
              `❌ Error al ${action} el producto: ${
                error.error?.message || 'Error desconocido'
              }`
            );
          }

          this.submitting = false;
        },
      });
    } else {
      if (this.colorImages.length === 0) {
        alert('❌ Debes agregar al menos un color con su imagen');
      }
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched() {
    Object.keys(this.productForm.controls).forEach((key) => {
      this.productForm.get(key)?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['min']) return 'El valor debe ser mayor o igual a 0';
    }
    return '';
  }
}
