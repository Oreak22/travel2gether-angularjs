import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { DestinationService } from '../../../../core/services/destination.service';
import { CardComponent } from '../../../../shared/components/card/card.component.ts/card.component.ts';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component.ts/badge.component.ts';

export interface PublicDestination {
  id: number | string;
  city: string;
  country: string;
  region: string;
  packagesCount: number;
  description: string;
  image: string;
}

@Component({
  selector: 'app-destinations',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, CardComponent, BadgeComponent],
  templateUrl: './destinations.component.html',
  styleUrl: './destinations.component.css',
})
export class DestinationsComponent implements OnInit {
  destinations = signal<PublicDestination[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  constructor(private destinationService: DestinationService) {}

  ngOnInit(): void {
    this.fetchDestinations();
  }

  fetchDestinations(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.destinationService.getPublicDestinations().subscribe({
      next: (res) => {
        const rawData = res.data || [];
        const mapped: PublicDestination[] = rawData.map((dest: any) => ({
          id: dest.id,
          city: dest.name || dest.city || 'Unknown',
          country: dest.country || '',
          region: dest.region || dest.region_tag || 'Global',
          // Maps package_count from publicIndex() or active_packages_count from index()
          packagesCount: Number(
            dest.package_count ??
              dest.active_packages_count ??
              dest.active_package_count ??
              dest.packagesCount ??
              0,
          ),
          description: dest.description || 'Explore scenic landscapes and curated travel packages.',
          image:
            dest.image_url ||
            dest.thumbnail_url ||
            dest.image ||
            'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600',
        }));
        this.destinations.set(mapped);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to load destinations.');
        this.isLoading.set(false);
      },
    });
  }
}
