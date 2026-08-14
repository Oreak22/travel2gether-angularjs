import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { PackageService, PackageStatus } from '../../../../core/services/package.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component/button.component';

export interface PackageItem {
  id: number;
  title: string;
  image: string;
  location: string;
  basePrice: number;
  bookedSeats: number;
  totalCapacity: number;
  status: PackageStatus;
  destination_id: number;
  duration_days: number;
  description: string;
}

@Component({
  selector: 'app-package-management',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, LucideAngularModule, ButtonComponent],
  templateUrl: './package-manager.component.html',
})
export class PackageManagerComponent implements OnInit {
  // Signals State
  packages = signal<PackageItem[]>([]);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Search & Pagination Controls
  searchQuery = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalItems = signal<number>(0);

  // Destinations & Inline Edit
  destinations = signal<Array<{ id: number; name: string; country: string }>>([]);
  editingId = signal<number | null>(null);

  editForm = {
    title: '',
    destination_id: 0,
    basePrice: 0,
    maxCapacity: 30,
  };

  constructor(private packageService: PackageService) {}

  ngOnInit(): void {
    this.fetchPackages();
  }

  private safeParseInt(val: any, fallback: number = 0): number {
    if (val === null || val === undefined) return fallback;
    const parsed = parseInt(String(val), 10);
    return isNaN(parsed) ? fallback : parsed;
  }

  private safeParseFloat(val: any, fallback: number = 0): number {
    if (val === null || val === undefined) return fallback;
    const parsed = parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
    return isNaN(parsed) ? fallback : parsed;
  }

  fetchPackages(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.packageService
      .getPackages({
        search: this.searchQuery(),
        page: this.currentPage(),
        limit: this.pageSize(),
      })
      .subscribe({
        next: (response: any) => {
          this.isLoading.set(false);
          const rawData = response.data?.items || response.data || [];

          const mappedPackages: PackageItem[] = rawData.map((item: any) => {
            const destName = item.destination?.city || item.destination_name || item.city || '';
            const destCountry =
              item.destination?.country || item.destination_country || item.country || '';
            const locationStr = [destName, destCountry].filter(Boolean).join(', ') || 'Global';

            // 1. Calculate capacity from schedules if present, or fallback
            const capacity = this.safeParseInt(
              item.total_capacity ?? item.max_capacity ?? item.total_seats ?? 30,
              30,
            );

            // 2. Calculate booked seats from (total_seats - available_seats) or booked_seats
            let booked = 0;
            if (item.booked_seats !== undefined && item.booked_seats !== null) {
              booked = this.safeParseInt(item.booked_seats, 0);
            } else if (item.total_seats !== undefined && item.available_seats !== undefined) {
              booked = Math.max(
                0,
                this.safeParseInt(item.total_seats) - this.safeParseInt(item.available_seats),
              );
            } else {
              booked = this.safeParseInt(item.seats_booked ?? 0, 0);
            }

            return {
              id: item.id,
              title: item.title || 'Untitled Package',
              image:
                item.cover_photo || item.thumbnail_url || 'assets/images/placeholder-package.jpg',
              location: locationStr,
              basePrice: this.safeParseFloat(item.base_price ?? item.price ?? 0),
              bookedSeats: booked,
              totalCapacity: capacity > 0 ? capacity : 1,
              status: item.status || 'draft',
              destination_id: this.safeParseInt(item.destination_id ?? item.destination?.id ?? 0),
              duration_days: this.safeParseInt(item.duration_days ?? 1, 1),
              description: item.description || item.title || '',
            };
          });

          this.packages.set(mappedPackages);

          if (response.meta?.pagination) {
            this.totalItems.set(response.meta.pagination.total_items);
          }
        },
        error: (err: any) => {
          this.isLoading.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to load package inventory.');
        },
      });
  }

  /**
   * Helper method to compute Occupancy / Occupation Percentage
   */
  getOccupancyRate(pkg: PackageItem): number {
    if (!pkg || !pkg.totalCapacity || pkg.totalCapacity <= 0) return 0;
    const rate = Math.round((pkg.bookedSeats / pkg.totalCapacity) * 100);
    return Math.min(Math.max(rate, 0), 100); // Clamp between 0% and 100%
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.fetchPackages();
  }

  toggleStatus(pkg: PackageItem): void {
    const nextStatus: PackageStatus = pkg.status === 'active' ? 'inactive' : 'active';
    const previousStatus = pkg.status;

    // Optimistic UI Update
    this.packages.update((items) =>
      items.map((p) => (p.id === pkg.id ? { ...p, status: nextStatus } : p)),
    );

    this.packageService.updateStatus(pkg.id, nextStatus).subscribe({
      error: (err: any) => {
        // Rollback on API error
        this.packages.update((items) =>
          items.map((p) => (p.id === pkg.id ? { ...p, status: previousStatus } : p)),
        );
        this.errorMessage.set(err?.error?.message || 'Failed to update package status.');
      },
    });
  }

  deletePackage(pkg: PackageItem): void {
    if (!confirm(`Are you sure you want to delete "${pkg.title}"?`)) {
      return;
    }

    this.packageService.deletePackage(pkg.id).subscribe({
      next: () => {
        this.packages.update((items) => items.filter((p) => p.id !== pkg.id));
      },
      error: (err: any) => {
        this.errorMessage.set(err?.error?.message || 'Failed to delete package.');
      },
    });
  }

  startInlineEdit(pkg: PackageItem): void {
    this.editingId.set(pkg.id);
    this.editForm = {
      title: pkg.title,
      destination_id: pkg.destination_id,
      basePrice: pkg.basePrice,
      maxCapacity: pkg.totalCapacity,
    };
  }

  saveInlineEdit(pkg: PackageItem): void {
    const pkgId = pkg.id;

    const payload = {
      title: this.editForm.title,
      destination_id: Number(this.editForm.destination_id),
      base_price: Number(this.editForm.basePrice),
      max_capacity: Number(this.editForm.maxCapacity),
      duration_days: pkg.duration_days,
      description: pkg.description,
    };

    this.packageService.updatePackage(pkgId, payload).subscribe({
      next: () => {
        const selectedDest = this.destinations().find(
          (d) => d.id === Number(this.editForm.destination_id),
        );
        const newLocation = selectedDest
          ? `${selectedDest.name}, ${selectedDest.country}`
          : pkg.location;

        this.packages.update((items) =>
          items.map((p) =>
            p.id === pkgId
              ? {
                  ...p,
                  title: this.editForm.title,
                  destination_id: Number(this.editForm.destination_id),
                  location: newLocation,
                  basePrice: Number(this.editForm.basePrice),
                  totalCapacity: Number(this.editForm.maxCapacity),
                }
              : p,
          ),
        );
        this.editingId.set(null);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to update package details.');
      },
    });
  }
  getOccupancyPercentage(pkg: PackageItem): number {
    if (!pkg || !pkg.totalCapacity || pkg.totalCapacity <= 0) return 0;
    const booked = Number(pkg.bookedSeats) || 0;
    const capacity = Number(pkg.totalCapacity) || 1;
    const percentage = Math.round((booked / capacity) * 100);
    return Math.min(Math.max(percentage, 0), 100);
  }
  cancelInlineEdit(): void {
    this.editingId.set(null);
  }
}
