import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import {
  LucideAngularModule,
  Plus,
  PlusCircle,
  DollarSign,
  CalendarCheck,
  Users,
  Package,
  Ellipsis,
  Check,
  X,
  ShieldCheck,
  Power,
  CheckCircle,
  AlertCircle,
} from 'lucide-angular';

import { CardComponent } from '../../../../shared/components/card/card.component.ts/card.component.ts';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component.ts/badge.component.ts.js';
import { ButtonComponent } from '../../../../shared/components/button/button.component/button.component.js';
import { AdminService } from '../../../../core/services/admin.service';
import { BookingService } from '../../../../core/services/booking.service';
import { PackageService, PackageStatus } from '../../../../core/services/package.service';

export interface DashboardBooking {
  rawId: number;
  id: string;
  customerName: string;
  customerEmail: string;
  packageName: string;
  departureDate: string;
  amount: number;
  status: string;
  reference?: string;
  isUpdating?: boolean;
}

export interface PackageSummary {
  id: number;
  title: string;
  destination: string;
  price: number;
  status: PackageStatus;
  isUpdating?: boolean;
}

@Component({
  selector: 'app-admin-dashboard.component',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    LucideAngularModule,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  isLoading = signal<boolean>(true);
  stats = signal<any[]>([]);
  recentBookings = signal<DashboardBooking[]>([]);
  recentPackages = signal<PackageSummary[]>([]);

  actionMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  constructor(
    private adminService: AdminService,
    private bookingService: BookingService,
    private packageService: PackageService,
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private parsePrice(value: any): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return isNaN(value) ? 0 : value;
    const cleaned = String(value).replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  loadDashboardData(): void {
    this.isLoading.set(true);

    forkJoin({
      bookingsRes: this.bookingService.getAdminBookings(),
      packagesRes: this.packageService.getPackages({ limit: 100 }),
    }).subscribe({
      next: ({ bookingsRes, packagesRes }) => {
        // 1. Process Bookings using exact API schema from fetchAdminBookings()
        const rawBookings = bookingsRes.data || [];
        const mappedBookings: DashboardBooking[] = rawBookings.map((b: any) => ({
          rawId: b.id,
          id: b.booking_reference || `J2G-${b.id}`,
          customerName: b.customer?.name || b.booker_name || 'Traveler',
          customerEmail: b.customer?.email || b.booker_email || 'N/A',
          packageName: b.package_title || b.title || 'Tour Package',
          departureDate: b.start_date || b.departure_date || 'Upcoming',
          amount: this.parsePrice(b.total_amount || 0),
          status: (b.status || 'pending').toLowerCase(),
          reference: b.payment_reference || b.transaction_ref || null,
          isUpdating: false,
        }));

        // Display 5 recent bookings in table
        this.recentBookings.set(mappedBookings.slice(0, 5));

        // 2. Process Packages Data
        const rawPackages = packagesRes.data?.items || packagesRes.data || [];
        const mappedPackages: PackageSummary[] = rawPackages.map((p: any) => ({
          id: p.id,
          title: p.title || p.name || 'Untitled Package',
          destination: p.destination_name || p.location || 'Global',
          price: this.parsePrice(p.price ?? p.base_price ?? 0),
          status: p.status || 'active',
          isUpdating: false,
        }));

        this.recentPackages.set(mappedPackages.slice(0, 5));

        // 3. Compute Real KPI Metrics
        this.calculateRealKPIs(mappedBookings, rawPackages);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load dashboard metrics', err);
        this.setDefaultStats();
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Calculates live stats from real booking records & package inventory
   */
  private calculateRealKPIs(bookings: DashboardBooking[], packages: any[]): void {
    // 1. Total Revenue: Sum total_amount across all bookings
    const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);

    // 2. Active Bookings: Count bookings with confirmed, paid, or pending status
    const activeBookingsCount = bookings.filter((b) =>
      ['confirmed', 'paid', 'pending', 'active'].includes(b.status.toLowerCase()),
    ).length;

    // 3. Total Customers: Count unique email addresses
    const uniqueEmails = new Set(
      bookings
        .map((b) => b.customerEmail)
        .filter((email) => email && email !== 'N/A' && email.trim() !== ''),
    );
    const totalCustomers = uniqueEmails.size || bookings.length;

    // 4. Total Packages Count
    const totalPackagesCount = packages.length;

    // Format into the stats signal
    this.stats.set([
      {
        label: 'Total Revenue',
        value: `₦${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: 'Live Total',
        isPositive: true,
        icon: 'dollar-sign',
        iconBg: 'bg-[#0F172A]',
      },
      {
        label: 'Active Bookings',
        value: `${activeBookingsCount}`,
        change: `${bookings.length} Total`,
        isPositive: true,
        icon: 'calendar-check',
        iconBg: 'bg-[#0EA5E9]',
      },
      {
        label: 'Total Customers',
        value: `${totalCustomers}`,
        change: 'Unique Travelers',
        isPositive: true,
        icon: 'users',
        iconBg: 'bg-emerald-600',
      },
      {
        label: 'Total Packages',
        value: `${totalPackagesCount}`,
        change: 'In Catalog',
        isPositive: true,
        icon: 'package',
        iconBg: 'bg-amber-500',
      },
    ]);
  }

  /**
   * Action: Update Booking Status
   */
  changeBookingStatus(booking: DashboardBooking, newStatus: string): void {
    if (booking.isUpdating) return;

    this.updateBookingUpdatingState(booking.rawId, true);

    this.bookingService.updateBookingStatus(booking.rawId, newStatus).subscribe({
      next: () => {
        this.recentBookings.update((list) =>
          list.map((b) =>
            b.rawId === booking.rawId ? { ...b, status: newStatus, isUpdating: false } : b,
          ),
        );
        this.showToast('success', `Booking #${booking.id} status updated to ${newStatus}.`);
        this.loadDashboardData();
      },
      error: (err) => {
        this.updateBookingUpdatingState(booking.rawId, false);
        this.showToast('error', err?.error?.message || 'Failed to update booking status.');
      },
    });
  }

  /**
   * Action: Re-verify Paystack Payment
   */
  verifyPayment(booking: DashboardBooking): void {
    if (!booking.reference || booking.reference === 'N/A') return;

    this.updateBookingUpdatingState(booking.rawId, true);

    this.bookingService.verifyPaystackAdmin(booking.reference).subscribe({
      next: (res) => {
        const updatedStatus = res.data?.status || 'confirmed';
        this.recentBookings.update((list) =>
          list.map((b) =>
            b.rawId === booking.rawId ? { ...b, status: updatedStatus, isUpdating: false } : b,
          ),
        );
        this.showToast('success', `Payment verified! Status is now ${updatedStatus}.`);
        this.loadDashboardData();
      },
      error: (err) => {
        this.updateBookingUpdatingState(booking.rawId, false);
        this.showToast('error', err?.error?.message || 'Payment verification failed.');
      },
    });
  }

  /**
   * Action: Toggle Package Status
   */
  togglePackageStatus(pkg: PackageSummary): void {
    const nextStatus: PackageStatus = pkg.status === 'active' ? 'inactive' : 'active';

    this.packageService.updateStatus(pkg.id, nextStatus).subscribe({
      next: () => {
        this.recentPackages.update((list) =>
          list.map((p) => (p.id === pkg.id ? { ...p, status: nextStatus } : p)),
        );
        this.showToast('success', `Package "${pkg.title}" status changed to ${nextStatus}.`);
      },
      error: (err) => {
        this.showToast('error', err?.error?.message || 'Failed to update package status.');
      },
    });
  }

  private updateBookingUpdatingState(rawId: number, state: boolean): void {
    this.recentBookings.update((list) =>
      list.map((b) => (b.rawId === rawId ? { ...b, isUpdating: state } : b)),
    );
  }

  private setDefaultStats(): void {
    this.stats.set([
      {
        label: 'Total Revenue',
        value: '₦0.00',
        change: '0.0%',
        isPositive: true,
        icon: 'dollar-sign',
        iconBg: 'bg-[#0F172A]',
      },
      {
        label: 'Active Bookings',
        value: '0',
        change: '0.0%',
        isPositive: true,
        icon: 'calendar-check',
        iconBg: 'bg-[#0EA5E9]',
      },
      {
        label: 'Total Customers',
        value: '0',
        change: '0.0%',
        isPositive: true,
        icon: 'users',
        iconBg: 'bg-emerald-600',
      },
      {
        label: 'Total Packages',
        value: '0',
        change: '0.0%',
        isPositive: true,
        icon: 'package',
        iconBg: 'bg-amber-500',
      },
    ]);
  }

  statusVariant(status: string): 'success' | 'warning' | 'danger' {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'paid':
      case 'active':
      case 'completed':
        return 'success';
      case 'pending':
      case 'draft':
        return 'warning';
      default:
        return 'danger';
    }
  }

  private showToast(type: 'success' | 'error', text: string): void {
    this.actionMessage.set({ type, text });
    setTimeout(() => this.actionMessage.set(null), 4000);
  }
}
