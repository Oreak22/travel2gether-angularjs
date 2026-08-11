import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

import { DestinationService } from '../../../../core/services/destination.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component/button.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component.ts/badge.component.ts';
import { AddDestinationModalComponent } from '../../components/add-destination-modal/add-destination-modal.component/add-destination-modal.component';

export interface Destination {
  id: string | number;
  thumbnail: string;
  city: string;
  country: string;
  regionTag: string;
  linkedPackages: number;
  rating?: number;
}

export interface MediaAsset {
  id: string | number;
  url: string;
  title: string;
  dimensions?: string;
  isCover?: boolean;
}

@Component({
  selector: 'app-destination-manager',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    ButtonComponent,
    BadgeComponent,
    AddDestinationModalComponent,
  ],
  templateUrl: './destination-manager.component.html',
  styleUrl: './destination-manager.component.css',
})
export class DestinationManagerComponent implements OnInit {
  private destinationService = inject(DestinationService);

  activeTab = signal<'destinations' | 'media'>('destinations');
  showAddModal = signal<boolean>(false);

  destinations = signal<Destination[]>([]);
  mediaAssets = signal<MediaAsset[]>([]);
  isLoading = signal<boolean>(false);
  isUploading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadDestinations();
    this.loadMediaAssets();
  }

  openModal(): void {
    this.showAddModal.set(true);
  }

  closeModal(): void {
    this.showAddModal.set(false);
  }

  onDestinationCreated(): void {
    this.loadDestinations();
    this.closeModal();
  }

  loadDestinations(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.destinationService.getAllDestinations().subscribe({
      next: (res) => {
        this.isLoading.set(false);
        const raw = res.data || [];
        const mapped: Destination[] = raw.map((d: any) => ({
          id: d.id,
          thumbnail: d.image_url || d.thumbnail || 'assets/images/placeholder-destination.jpg',
          city: d.name || d.city || 'Unknown',
          country: d.country || '',
          regionTag: d.region || d.region_tag || 'Global',
          // Read active_packages_count from backend index() payload
          linkedPackages: d.active_packages_count ?? d.package_count ?? d.linkedPackages ?? 0,
          rating: parseFloat(d.rating || '4.8'),
        }));
        this.destinations.set(mapped);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to load destinations.');
      },
    });
  }

  loadMediaAssets(): void {
    this.destinationService.getMediaAssets().subscribe({
      next: (res) => {
        const raw = res.data || [];
        const mapped: MediaAsset[] = raw.map((m: any) => ({
          id: m.id,
          url: m.file_url || m.url,
          title: m.file_name || m.title || 'Media Asset',
          dimensions: m.dimensions || '800x400',
          isCover: Boolean(m.is_cover || m.isCover),
        }));
        this.mediaAssets.set(mapped);
      },
      error: () => {
        // Fall back gracefully if media library table isn't populated yet
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadFile(input.files[0]);
    }
  }

  uploadFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('Please select a valid image file.');
      return;
    }

    this.isUploading.set(true);
    this.errorMessage.set(null);

    const formData = new FormData();
    formData.append('file', file);

    this.destinationService.uploadMedia(formData).subscribe({
      next: () => {
        this.isUploading.set(false);
        this.loadMediaAssets();
      },
      error: (err) => {
        this.isUploading.set(false);
        this.errorMessage.set(err?.error?.message || 'Media upload failed.');
      },
    });
  }

  deleteMediaAsset(assetId: string | number): void {
    this.destinationService.deleteMedia(Number(assetId)).subscribe({
      next: () => {
        this.mediaAssets.update((items) => items.filter((m) => m.id !== assetId));
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to delete asset.');
      },
    });
  }
}
