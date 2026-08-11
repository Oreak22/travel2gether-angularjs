import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

import { PackageService } from '../../../../core/services/package.service';
import { CardComponent } from '../../../../shared/components/card/card.component.ts/card.component.ts';
import { ButtonComponent } from '../../../../shared/components/button/button.component/button.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    LucideAngularModule,
    CardComponent,
    ButtonComponent,
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
})
export class LandingPageComponent implements OnInit {
  activeCategory = 'All Experiences';
  searchLocation = '';
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  categories = [
    'All Experiences',
    'Beach Getaways',
    'Mountain Treks',
    'Cultural Tours',
    'Safari Adventures',
    'Luxury Escapes',
  ];

  featuredPackages = signal<any[]>([]);
  skeletonCards = Array.from({ length: 3 });

  constructor(
    private packageService: PackageService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.fetchFeaturedPackages();
  }

  fetchFeaturedPackages(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.packageService.getPackages({ limit: 3 }).subscribe({
      next: (res) => {
        const rawData = res.data || [];
        const mapped = rawData.map((pkg: any) => ({
          id: pkg.id,
          title: pkg.title,
          location: pkg.destination_name || pkg.location || 'Worldwide',
          duration: `${pkg.duration_days || 5} Days / ${pkg.duration_nights || 4} Nights`,
          rating: pkg.rating || '4.9',
          price: pkg.base_price || pkg.price || '0.00',
          image:
            pkg.cover_image ||
            pkg.image ||
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
        }));
        this.featuredPackages.set(mapped);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Unable to load featured packages.');
        this.isLoading.set(false);
      },
    });
  }

  onSearch(): void {
    this.router.navigate(['/packages'], {
      queryParams: { search: this.searchLocation || null },
    });
  }

  selectCategory(category: string): void {
    this.activeCategory = category;
    this.router.navigate(['/packages'], {
      queryParams: category !== 'All Experiences' ? { category } : {},
    });
  }
}
