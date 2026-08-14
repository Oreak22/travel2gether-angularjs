import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { PackageService } from '../../../../core/services/package.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component/button.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component.ts/badge.component.ts';

export interface ScheduleItem {
  id: number;
  start_date: string;
  end_date: string;
  total_seats: number;
  available_seats: number;
  booked_seats: number;
  price: number;
  status: string;
}

export interface DetailedPackage {
  id: number;
  title: string;
  description: string;
  base_price: number;
  duration_days: number;
  status: string;
  total_capacity: number;
  booked_seats: number;
  occupancy_rate: number;
  destination: {
    id: number;
    name: string;
    country: string;
    description?: string;
  };
  schedules: ScheduleItem[];
  itineraries: any[];
  photos: any[];
  cover_photo?: string;
}

@Component({
  selector: 'app-package-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LucideAngularModule,
    ButtonComponent,
    BadgeComponent,
  ],
  templateUrl: './package-detail.component.html',
  styleUrl: './package-detail.component.css',
})
export class PackageDetailComponent implements OnInit {
  openDay = signal<number>(1);
  isLoading = signal<boolean>(true);
  packageData = signal<DetailedPackage | null>(null);
  selectedScheduleId = signal<number | null>(null);
  errorMessage = signal<string | null>(null);

  itinerary = signal<any[]>([]);
  schedules = signal<ScheduleItem[]>([]);

  constructor(
    private route: ActivatedRoute,
    private packageService: PackageService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const packageId = params.get('id');
      if (packageId) {
        this.fetchPackageDetails(packageId);
      } else {
        this.isLoading.set(false);
        this.errorMessage.set('Invalid package selection.');
      }
    });
  }

  fetchPackageDetails(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.packageService.getPackageById(id).subscribe({
      next: (res) => {
        const data = res.data || null;
        if (!data) {
          this.packageData.set(null);
          this.errorMessage.set('Package details are unavailable at the moment.');
          this.isLoading.set(false);
          return;
        }

        this.packageData.set(data);
        console.log(data);

        // Map Itineraries
        const rawItineraries = data.itineraries || [];
        const mappedItineraries = rawItineraries.map((it: any) => {
          let parsedHighlights: string[] = [];
          if (typeof it.highlights === 'string') {
            try {
              parsedHighlights = JSON.parse(it.highlights);
            } catch {
              parsedHighlights = [];
            }
          } else if (Array.isArray(it.highlights)) {
            parsedHighlights = it.highlights;
          }

          return {
            dayNumber: it.day_number || it.dayNumber,
            title: it.title || `Day ${it.day_number || it.dayNumber}`,
            description: it.description || 'Details will be provided shortly.',
            highlights: parsedHighlights,
          };
        });
        this.itinerary.set(mappedItineraries);

        // Map Departure Schedules
        const rawSchedules = data.schedules || [];
        this.schedules.set(rawSchedules);
        if (rawSchedules.length > 0) {
          this.selectedScheduleId.set(rawSchedules[0].id);
        } else {
          this.selectedScheduleId.set(null);
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Unable to load package details.');
        this.isLoading.set(false);
      },
    });
  }

  toggleDay(dayNum: number): void {
    this.openDay.update((curr) => (curr === dayNum ? 0 : dayNum));
  }

  selectSchedule(scheduleId: number): void {
    this.selectedScheduleId.set(scheduleId);
  }

  /**
   * Returns current schedule occupancy percentage
   */
  getScheduleOccupancy(schedule: ScheduleItem): number {
    if (!schedule || !schedule.total_seats || schedule.total_seats <= 0) return 0;
    const booked = schedule.booked_seats ?? schedule.total_seats - schedule.available_seats;
    return Math.round((booked / schedule.total_seats) * 100);
  }
}
