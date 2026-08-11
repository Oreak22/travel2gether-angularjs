import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonComponent } from '../../../../shared/components/button/button.component/button.component';
import { HttpClient } from '@angular/common/http';
// import environment from '../../../../../environments/environment';
// import { environment } from '../../../../environments/environment';

interface MediaItem {
  id: string | number;
  name: string;
  url: string;
  size?: string;
  created_at?: string;
}

@Component({
  selector: 'app-media-manager.component',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ButtonComponent],
  templateUrl: './media-manager.component.html',
  styleUrl: './media-manager.component.css',
})
export class MediaManagerComponent implements OnInit {
  // private mediaApiUrl = `${environment.apiUrl}/admin/media`;

  images = signal<MediaItem[]>([]);
  isLoading = signal<boolean>(true);
  isUploading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // this.fetchMedia();
  }

  // fetchMedia(): void {
  //   this.isLoading.set(true);
  //   this.http.get<{ status: string; data: MediaItem[] }>(this.mediaApiUrl).subscribe({
  //     next: (res) => {
  //       const items = (res.data || []).map((img: any) => ({
  //         id: img.id,
  //         name: img.filename || img.name || 'image.jpg',
  //         url: img.url || img.filepath,
  //         size: img.size,
  //         created_at: img.created_at,
  //       }));
  //       this.images.set(items);
  //       this.isLoading.set(false);
  //     },
  //     error: (err) => {
  //       this.errorMessage.set(err.error?.message || 'Failed to load media library.');
  //       this.isLoading.set(false);
  //     },
  //   });
  // }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    // this.uploadFile(file);
  }

  // uploadFile(file: File): void {
  //   const formData = new FormData();
  //   formData.append('image', file, file.name);

  //   this.isUploading.set(true);
  //   this.http
  //     .post<{ status: string; message: string; data: MediaItem }>(
  //       `${this.mediaApiUrl}/upload`,
  //       formData,
  //     )
  //     .subscribe({
  //       next: () => {
  //         this.isUploading.set(false);
  //         this.fetchMedia(); // Refresh list after upload
  //       },
  //       error: (err) => {
  //         this.isUploading.set(false);
  //         alert(err.error?.message || 'Failed to upload image.');
  //       },
  //     });
  // }

  // deleteMedia(item: MediaItem): void {
  //   if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

  //   this.http
  //     .request('delete', `${this.mediaApiUrl}/delete`, {
  //       body: { id: item.id },
  //     })
  //     .subscribe({
  //       next: () => {
  //         this.images.set(this.images().filter((img) => img.id !== item.id));
  //       },
  //       error: (err) => {
  //         alert(err.error?.message || 'Failed to delete image.');
  //       },
  //     });
  // }
}
