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

  constructor(private packageService: PackageService) {}

  ngOnInit(): void {
    this.fetchPackages();
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
          const rawData = response.data || [];

          const mappedPackages: PackageItem[] = rawData.map((item: any) => {
            const destName = item.destination?.name || item.destination_name || '';
            const destCountry = item.destination?.country || item.destination_country || '';
            const locationStr = [destName, destCountry].filter(Boolean).join(', ') || 'N/A';

            return {
              id: item.id,
              title: item.title || 'Untitled Package',
              image:
                item.cover_photo || item.cover_image || 'assets/images/placeholder-package.jpg',
              location: locationStr,
              basePrice: parseFloat(item.base_price || item.price || 0),
              bookedSeats: item.booked_seats || item.bookedSeats || 0,
              totalCapacity: item.total_capacity || item.max_capacity || 30,
              status: item.status || 'draft',
              // Preserve fields required for validation on PUT requests
              destination_id: item.destination_id || item.destination?.id || 0,
              duration_days: parseInt(item.duration_days || 1, 10),
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
        // Remove item locally or refetch
        this.packages.update((items) => items.filter((p) => p.id !== pkg.id));
      },
      error: (err: any) => {
        this.errorMessage.set(err?.error?.message || 'Failed to delete package.');
      },
    });
  }

  // 1. In Component Class
  destinations = signal<Array<{ id: number; name: string; country: string }>>([]);
  editingId = signal<number | null>(null);

  editForm = {
    title: '',
    destination_id: 0,
    basePrice: 0,
    maxCapacity: 30,
  };

  // 2. Start Editing Method
  startInlineEdit(pkg: PackageItem): void {
    this.editingId.set(pkg.id);
    this.editForm = {
      title: pkg.title,
      destination_id: pkg.destination_id,
      basePrice: pkg.basePrice,
      maxCapacity: pkg.totalCapacity,
    };
  }

  // 3. Save Editing Method
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
        // Find destination name to update the display label
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

  cancelInlineEdit(): void {
    this.editingId.set(null);
  }
}
