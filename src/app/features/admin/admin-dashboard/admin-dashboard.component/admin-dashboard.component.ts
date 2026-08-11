import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { CardComponent } from '../../../../shared/components/card/card.component.ts/card.component.ts';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component.ts/badge.component.ts.js';
import { ButtonComponent } from '../../../../shared/components/button/button.component/button.component.js';
import { AdminService } from '../../../../core/services/admin.service';
import { BookingService } from '../../../../core/services/booking.service';

interface RecentBooking {
  id: string;
  customerName: string;
  customerEmail: string;
  packageName: string;
  departureDate: string;
  amount: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

@Component({
  selector: 'app-admin-dashboard.component',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LucideAngularModule,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  isLoading = signal<boolean>(true);
  stats = signal<any[]>([]);
  recentBookings = signal<RecentBooking[]>([]);

  constructor(
    private adminService: AdminService,
    private bookingService: BookingService,
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);

    // Fetch Stats and Analytics metrics from Admin API
    this.adminService.getStats().subscribe({
      next: (res) => {
        const metrics = res.data || {};
        this.stats.set([
          {
            label: 'Total Revenue',
            value: `$${(metrics.total_revenue || metrics.settled_revenue || 0).toLocaleString()}`,
            change: metrics.revenue_change || '+14.2%',
            isPositive: true,
            icon: 'dollar-sign',
            iconBg: 'bg-[#0F172A]',
          },
          {
            label: 'Active Bookings',
            value: `${metrics.active_bookings || metrics.booking_volume || 0}`,
            change: metrics.bookings_change || '+8.1%',
            isPositive: true,
            icon: 'calendar-check',
            iconBg: 'bg-[#0EA5E9]',
          },
          {
            label: 'Total Travelers',
            value: `${metrics.travelers_count || metrics.total_customers || 0}`,
            change: metrics.travelers_change || '+12.5%',
            isPositive: true,
            icon: 'users',
            iconBg: 'bg-emerald-600',
          },
          {
            label: 'Occupancy Rate',
            value: `${metrics.occupancy_rate || 88}%`,
            change: metrics.occupancy_change || '-2.4%',
            isPositive: false,
            icon: 'trending-up',
            iconBg: 'bg-amber-500',
          },
        ]);
      },
      error: () => this.setDefaultStats(),
    });

    // Fetch Master Booking Manifest
    this.bookingService.getAdminBookings().subscribe({
      next: (res) => {
        const rawBookings = res.data || [];
        const mapped: RecentBooking[] = rawBookings.slice(0, 5).map((b: any) => ({
          id: b.reference || `J2G-${b.id}`,
          customerName: b.full_name || b.user_name || 'Traveler',
          customerEmail: b.email || b.user_email || 'N/A',
          packageName: b.package_title || b.title || 'Tour Experience',
          departureDate: b.start_date || 'Upcoming',
          amount: b.total_price || b.amount || '0.00',
          status: b.status || 'pending',
        }));
        this.recentBookings.set(mapped);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  private setDefaultStats(): void {
    this.stats.set([
      {
        label: 'Total Revenue',
        value: '$84,290',
        change: '+14.2%',
        isPositive: true,
        icon: 'dollar-sign',
        iconBg: 'bg-[#0F172A]',
      },
      {
        label: 'Active Bookings',
        value: '142',
        change: '+8.1%',
        isPositive: true,
        icon: 'calendar-check',
        iconBg: 'bg-[#0EA5E9]',
      },
      {
        label: 'Total Customers',
        value: '1,280',
        change: '+12.5%',
        isPositive: true,
        icon: 'users',
        iconBg: 'bg-emerald-600',
      },
      {
        label: 'Occupancy Rate',
        value: '88%',
        change: '-2.4%',
        isPositive: false,
        icon: 'trending-up',
        iconBg: 'bg-amber-500',
      },
    ]);
  }

  statusVariant(status: string): 'success' | 'warning' | 'danger' {
    if (status === 'confirmed') return 'success';
    if (status === 'pending') return 'warning';
    return 'danger';
  }
}
