import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div class="text-center">
        <h1 class="text-4xl font-extrabold">404</h1>
        <p class="mt-4 text-lg text-slate-600">Page not found or you do not have access.</p>
        <div class="mt-6 space-x-3">
          <a routerLink="/" class="text-sm font-semibold text-[#0EA5E9]">Go home</a>
          <a routerLink="/auth" class="text-sm font-semibold text-[#0EA5E9]">Sign in</a>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class NotFoundComponent {}
