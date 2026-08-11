import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../services/auth.service';

interface NavChildItem {
  label: string;
  icon: string;
  route: string;
}

interface NavItem {
  label: string;
  icon: string;
  route: string;
  badge?: string;
  children?: NavChildItem[];
}

@Component({
  selector: 'app-admin-layout.component',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent {
  isMobileMenuOpen = signal<boolean>(false);

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'layout-dashboard', route: '/admin' },
    {
      label: 'Packages',
      icon: 'package',
      route: '/admin/packages',
      children: [
        { label: 'Manage Packages', icon: 'package-open', route: '/admin/packages' },
        { label: 'Create Package', icon: 'circle-plus', route: '/admin/packages/create' },
      ],
    },
    { label: 'Bookings', icon: 'calendar-check', route: '/admin/bookings', badge: '12' },
    { label: 'Destinations', icon: 'compass', route: '/admin/destinations' },
    { label: 'Media Manager', icon: 'folder-kanban', route: '/admin/media' },
    { label: 'Analytics', icon: 'chart-column', route: '/admin/analytics' },
  ];

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((prev) => !prev);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
  private authService = inject(AuthService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout();

    // Perform the actual navigation
    this.router.navigate(['/']);
  }

  sidebarClasses(): string {
    const base =
      'bg-[#0F172A] w-64 flex-col justify-between fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out md:translate-x-0 flex';
    const mobileVisibility = this.isMobileMenuOpen() ? 'translate-x-0' : '-translate-x-full';
    return `${base} ${mobileVisibility}`;
  }
}
