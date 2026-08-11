import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

import { BookingService } from '../../../../core/services/booking.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component/button.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component.ts/badge.component.ts';

export interface AdminBooking {
  id: string;
  numericId: number;
  customerName: string;
  customerEmail: string;
  packageTitle: string;
  guestsCount: number;
  totalPaid: string | number;
  paystackRef: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface ToastMessage {
  type: 'success' | 'danger' | 'info';
  message: string;
}

@Component({
  selector: 'app-booking-manager',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, BadgeComponent, ButtonComponent],
  templateUrl: './booking-manager.component.html',
  styleUrl: './booking-manager.component.css',
})
export class BookingManagerComponent implements OnInit {
  bookings = signal<AdminBooking[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  // Professional Feedback & Loading States
  verifyingRef = signal<string | null>(null);
  updatingBookingId = signal<number | null>(null);
  toast = signal<ToastMessage | null>(null);

  // Key-value tracking for inline row feedback: { 'TRX-123': 'success' | 'error' }
  verificationResults = signal<Record<string, { status: 'success' | 'error'; message: string }>>(
    {},
  );

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.fetchAdminBookings();
  }

  showToast(type: 'success' | 'danger' | 'info', message: string): void {
    this.toast.set({ type, message });
    setTimeout(() => {
      if (this.toast()?.message === message) {
        this.toast.set(null);
      }
    }, 5000);
  }

  fetchAdminBookings(): void {
    this.isLoading.set(true);
    this.bookingService.getAdminBookings().subscribe({
      next: (res) => {
        const rawData = res.data || [];
        const mapped: AdminBooking[] = rawData.map((b: any) => ({
          id: b.booking_reference || `J2G-${b.id}`,
          numericId: b.id,
          customerName: b.customer?.name || b.booker_name || 'Traveler',
          customerEmail: b.customer?.email || b.booker_email || 'N/A',
          packageTitle: b.package_title || 'Tour Package',
          guestsCount: b.seats_booked || 1,
          totalPaid: b.total_amount || '0.00',
          paystackRef: b.payment_reference || b.transaction_ref || 'N/A',
          status: b.status || 'pending',
        }));
        this.bookings.set(mapped);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.error?.message || 'Failed to retrieve master bookings manifest.',
        );
        this.isLoading.set(false);
      },
    });
  }

  updateStatus(booking: AdminBooking, newStatus: 'confirmed' | 'pending' | 'cancelled'): void {
    this.updatingBookingId.set(booking.numericId);

    this.bookingService.updateBookingStatus(booking.numericId, newStatus).subscribe({
      next: () => {
        this.updatingBookingId.set(null);
        this.showToast('success', `Booking status for ${booking.id} updated to "${newStatus}".`);
        this.fetchAdminBookings();
      },
      error: (err) => {
        this.updatingBookingId.set(null);
        this.showToast(
          'danger',
          err?.error?.message || `Failed to update booking status for ${booking.id}.`,
        );
      },
    });
  }

  verifyPaystack(reference: string): void {
    if (!reference || reference === 'N/A') return;

    this.verifyingRef.set(reference);

    this.bookingService.verifyPaystackAdmin(reference).subscribe({
      next: (res) => {
        this.verifyingRef.set(null);
        const msg = res.message || 'Payment successfully verified on Paystack gateway!';

        // Record inline success
        this.verificationResults.update((prev) => ({
          ...prev,
          [reference]: { status: 'success', message: 'Verified' },
        }));

        this.showToast('success', msg);
        this.fetchAdminBookings();
      },
      error: (err) => {
        this.verifyingRef.set(null);
        const errMsg =
          err?.error?.message || 'Paystack verification failed or transaction not found.';

        // Record inline error
        this.verificationResults.update((prev) => ({
          ...prev,
          [reference]: { status: 'error', message: 'Failed' },
        }));

        this.showToast('danger', errMsg);
      },
    });
  }

  statusVariant(status: string): 'success' | 'warning' | 'danger' {
    if (status === 'confirmed') return 'success';
    if (status === 'pending') return 'warning';
    return 'danger';
  }
}
