import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

// Fixed import path typos
import { BookingService } from '../../../../core/services/booking.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component/button.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component.ts/badge.component.ts';

interface Booking {
  id: string;
  numericId: number;
  packageTitle: string;
  image: string;
  dates: string;
  guests: number;
  amount: string | number;
  status: 'confirmed' | 'pending' | 'cancelled';
  paystackRef: string;
  ticket_token: string;
}

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, ButtonComponent, BadgeComponent],
  templateUrl: './my-bookings.component.html',
  styleUrl: './my-bookings.component.css',
})
export class MyBookingsComponent implements OnInit {
  activeTab = signal<string>('all');
  selectedReceipt = signal<Booking | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  bookings = signal<Booking[]>([]);

  // Tracks active payment redirection
  processingPaymentId = signal<number | null>(null);

  filteredBookings = computed(() => {
    const list = this.bookings();
    if (this.activeTab() === 'all') return list;
    return list.filter((b) => b.status === this.activeTab());
  });

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.fetchMyBookings();
  }
  qrCodeDataUrl = signal<string | null>(null);

  fetchMyBookings(): void {
    this.isLoading.set(true);
    this.bookingService.getMyBookings().subscribe({
      next: (res) => {
        const rawData = res.data || [];
        console.log(res);
        const mapped: Booking[] = rawData.map((b: any) => ({
          id: b.booking_reference || `J2G-${b.id}`,
          numericId: b.id,
          packageTitle: b.package_title || b.title || 'Tour Experience',
          image:
            b.cover_photo || 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=200',
          dates: b.start_date ? `${b.start_date} - ${b.end_date}` : 'Scheduled Tour',
          guests: b.seats_booked || b.guests || 1,

          //  FIX 1: Map b.total_amount returned by BookingController
          amount: b.total_amount || b.total_price || b.amount || '0.00',
          status: b.status || 'pending',
          paystackRef: b.payment_reference || b.transaction_ref || 'N/A',
          ticket_token: b.ticket_token,
        }));
        this.bookings.set(mapped);
        this.isLoading.set(false);
        console.log(rawData);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to load booking history.');
        this.isLoading.set(false);
      },
    });
  }

  /**
   *  FIX 2: Added payment initialization handler for pending bookings
   */
  payNow(booking: Booking): void {
    if (!booking || booking.numericId <= 0) return;

    this.processingPaymentId.set(booking.numericId);
    this.errorMessage.set(null);

    // const callbackUrl = `${window.location.origin}/payment/confirm`;

    this.bookingService.initializePayment(booking.numericId).subscribe({
      next: (res) => {
        this.processingPaymentId.set(null);
        if (res.data?.authorization_url) {
          // Redirect traveler to Paystack secure payment page
          window.location.href = res.data.authorization_url;
        } else {
          this.errorMessage.set('Paystack checkout URL could not be generated.');
        }
      },
      error: (err) => {
        this.processingPaymentId.set(null);
        this.errorMessage.set(err.error?.message || 'Failed to initialize payment session.');
      },
    });
  }

  cancelBooking(booking: Booking): void {
    if (!confirm(`Are you sure you want to cancel booking ${booking.id}?`)) return;

    this.bookingService.cancelBooking(booking.numericId).subscribe({
      next: () => {
        this.fetchMyBookings();
      },
      error: (err) => {
        alert(err.error?.message || 'Failed to cancel booking.');
      },
    });
  }

  statusVariant(status: string): 'success' | 'warning' | 'danger' {
    if (status === 'confirmed') return 'success';
    if (status === 'pending') return 'warning';
    return 'danger';
  }

  openReceipt(booking: Booking): void {
    this.selectedReceipt.set(booking);
    console.log(booking);
    // Generate QR code image URL from the signed backend JWT ticketToken
    if (booking.ticket_token) {
      const encodedToken = encodeURIComponent(booking.ticket_token);
      this.qrCodeDataUrl.set(
        `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodedToken}`,
      );
      console.log(booking.ticket_token);
    }
  }

  closeReceipt(): void {
    this.selectedReceipt.set(null);
    this.qrCodeDataUrl.set(null);
  }
  downloadReceipt(): void {
    window.print();
  }
}
