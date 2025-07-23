import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex justify-center items-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
      ></div>
      <span class="ml-3 text-gray-600">Cargando...</span>
    </div>
  `,
  styles: [],
})
export class LoadingComponent {}
