import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

import { PackageService } from '../../../../core/services/package.service';
import { CardComponent } from '../../../../shared/components/card/card.component.ts/card.component.ts';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component.ts/badge.component.ts';
import { ButtonComponent } from '../../../../shared/components/button/button.component/button.component';

@Component({
  selector: 'app-package-catalog',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    LucideAngularModule,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
  ],
  templateUrl: './package-catalog.component.html',
  styleUrl: './package-catalog.component.css',
})
export class PackageCatalogComponent implements OnInit {
  isMobileFilterOpen = signal(false);
  isLoading = signal(true);
  searchQuery = '';
  maxPrice = 10000000;
  selectedCategory = signal('All Experiences');
  errorMessage = signal<string | null>(null);
  skeletonCards = Array.from({ length: 6 });

  catalogPackages = signal<any[]>([]);

  constructor(
    private packageService: PackageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.searchQuery = params.get('search') || '';
      this.maxPrice = Number(params.get('max_price') || 10000000);
      this.selectedCategory.set(params.get('category') || 'All Experiences');
      this.fetchPackages();
    });
  }

  fetchPackages(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const filters: any = {
      search: this.searchQuery || undefined,
      max_price: this.maxPrice,
    };

    if (this.selectedCategory() !== 'All Experiences') {
      filters.category = this.selectedCategory();
    }

    this.packageService.getPackages(filters).subscribe({
      next: (res) => {
        const rawData = res.data || [];
        const mapped = rawData
          .filter((pkg: any) => pkg.status == 'active')
          .map((pkg: any) => ({
            id: pkg.id,
            title: pkg.title,
            location: pkg.destination?.name
              ? `${pkg.destination.name}, ${pkg.destination.country}`
              : pkg.destination_name || pkg.location || 'Worldwide',
            category: pkg.category || 'Tour',
            rating: pkg.rating || '4.8',
            price: parseFloat(pkg.base_price || pkg.price || 0),
            summary: pkg.description || pkg.summary || '',
            image:
              pkg.cover_photo ||
              pkg.cover_image ||
              pkg.image 
              // 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
          }));
        this.catalogPackages.set(mapped);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to load travel packages.');
        this.isLoading.set(false);
      },
    });
  }

  toggleMobileFilters(): void {
    this.isMobileFilterOpen.update((v) => !v);
  }

  onSearch(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchQuery || null,
        max_price: this.maxPrice !== 10000000 ? this.maxPrice : null,
        category: this.selectedCategory() !== 'All Experiences' ? this.selectedCategory() : null,
      },
      queryParamsHandling: 'merge',
    });
  }

  setCategory(category: string): void {
    this.selectedCategory.set(category);
    this.onSearch();
  }

  onMaxPriceChange(value: string | number): void {
    const price = Number(value);
    if (!Number.isNaN(price)) {
      this.maxPrice = price;
      this.onSearch(); // Triggers URL update and package refetch
    }
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.maxPrice = 10000000;
    this.selectedCategory.set('All Experiences');
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: null, max_price: null, category: null },
      queryParamsHandling: 'merge',
    });
  }
}
