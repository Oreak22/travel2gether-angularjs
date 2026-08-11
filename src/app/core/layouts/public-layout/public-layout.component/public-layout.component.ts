import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';

type DropdownKey = 'packages' | 'account' | null;

@Component({
  selector: 'app-public-layout.component',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.css',
})
export class PublicLayoutComponent {
  isMobileMenuOpen = signal<true | false>(false);
  activeDropdown = signal<DropdownKey>(null);
  private dropdownCloseTimer: number | null = null;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((v) => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
    this.closeDropdowns();
  }

  toggleDropdown(key: Exclude<DropdownKey, null>): void {
    if (this.activeDropdown() === key) {
      this.closeDropdowns();
    } else {
      this.openDropdown(key);
    }
  }

  openDropdown(key: Exclude<DropdownKey, null>): void {
    this.clearDropdownCloseTimer();
    this.activeDropdown.set(key);
  }

  cancelDropdownClose(): void {
    this.clearDropdownCloseTimer();
  }

  scheduleDropdownClose(): void {
    this.clearDropdownCloseTimer();
    this.dropdownCloseTimer = window.setTimeout(() => {
      this.activeDropdown.set(null);
      this.dropdownCloseTimer = null;
    }, 180);
  }

  closeDropdowns(): void {
    this.clearDropdownCloseTimer();
    this.activeDropdown.set(null);
  }
  private authService = inject(AuthService);
  isAdmin = this.authService.isAdmin;
  isAuthenticated = this.authService.isAuthenticated;
  private router = inject(Router);
  logout(): void {
    this.authService.logout();

    // Perform the actual navigation
    this.router.navigate(['/']);
  }

  private clearDropdownCloseTimer(): void {
    if (this.dropdownCloseTimer) {
      window.clearTimeout(this.dropdownCloseTimer);
      this.dropdownCloseTimer = null;
    }
  }
}
