import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { BookingService } from '../../../../core/services/booking.service';
import { AuthService } from '../../../../core/services/auth.service';
import { PackageService } from '../../../../core/services/package.service';
import { ButtonComponent } from '../../../../shared/components/button/button.component/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component/input.component';
import { CardComponent } from '../../../../shared/components/card/card.component.ts/card.component.ts';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule,
    ButtonComponent,
    InputComponent,
    CardComponent,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  guestCount = signal<number>(1);
  selectedPayment = signal<'paystack' | 'card'>('paystack');
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  scheduleId = signal<number | null>(null);
  packageId = signal<number | null>(null);
  packageData = signal<any | null>(null);
  unitPrice = signal<number>(0);
  isPriceLoading = signal<boolean>(false);

  checkoutForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private bookingService: BookingService,
    private packageService: PackageService,
    private authService: AuthService,
  ) {
    this.checkoutForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      idType: ['nin', Validators.required],
      idNumber: ['', Validators.required],
      emergencyName: ['', Validators.required],
      emergencyPhone: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const sId = this.route.snapshot.queryParamMap.get('schedule_id');
    const pId = this.route.snapshot.queryParamMap.get('package_id');
    if (sId) this.scheduleId.set(Number(sId));
    if (pId) this.packageId.set(Number(pId));

    // Fetch package details to determine real pricing
    if (pId) {
      this.fetchPackageDetails(Number(pId));
    }

    // If user returned from auth flow with saved pending booking, restore it
    try {
      const raw = localStorage.getItem('pending_booking_state');
      if (raw) {
        const state = JSON.parse(raw);
        // Only restore if returning to checkout
        if (state && state.returnUrl && state.returnUrl.includes('/checkout')) {
          if (state.package_id) this.packageId.set(state.package_id);
          if (state.schedule_id) this.scheduleId.set(state.schedule_id);
          if (state.guest_count) this.guestCount.set(state.guest_count);
          if (state.formValues) this.checkoutForm.patchValue(state.formValues);
          // refetch pricing if package id was restored
          if (state.package_id) this.fetchPackageDetails(state.package_id);
        }
        // Remove saved state after restoring
        localStorage.removeItem('pending_booking_state');
      }
    } catch (e) {
      // ignore JSON parse errors
      localStorage.removeItem('pending_booking_state');
    }
  }

  private savePendingBookingState(): void {
    try {
      const state = {
        returnUrl: this.router.url,
        package_id: this.packageId(),
        schedule_id: this.scheduleId(),
        guest_count: this.guestCount(),
        formValues: this.checkoutForm.value,
      };
      localStorage.setItem('pending_booking_state', JSON.stringify(state));
    } catch (e) {
      // ignore
    }
  }

  fetchPackageDetails(id: number): void {
    this.isPriceLoading.set(true);
    this.packageService.getPackageById(id).subscribe({
      next: (res) => {
        const data = res.data || null;
        this.packageData.set(data);

        // Determine unit price: prefer schedule price, fallback to package base_price
        let price = 0;
        if (data) {
          const schedules = data.schedules || [];
          const sched = schedules.find((s: any) => s.id === this.scheduleId());
          if (sched && typeof sched.price === 'number') {
            price = sched.price;
          } else if (typeof data.base_price === 'number') {
            price = data.base_price;
          }
        }
        this.unitPrice.set(price || 0);
        this.isPriceLoading.set(false);
      },
      error: () => {
        this.unitPrice.set(0);
        this.isPriceLoading.set(false);
      },
    });
  }

  updateGuests(delta: number): void {
    const next = this.guestCount() + delta;
    if (next >= 1) this.guestCount.set(next);
  }

  proceedToPayment(): void {
    // If user not authenticated, save state and redirect to auth page
    if (!this.authService.isAuthenticated()) {
      this.savePendingBookingState();
      this.router.navigate(['/auth'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }

    if (!this.scheduleId()) {
      this.errorMessage.set(
        'Please select a valid package schedule before proceeding to checkout.',
      );
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValues = this.checkoutForm.value;

    // Construct valid passenger payload matching BookingController@create validation rules
    const passengersPayload = Array.from({ length: this.guestCount() }, (_, i) => ({
      full_name:
        i === 0
          ? `${formValues.firstName} ${formValues.lastName}`.trim()
          : `Guest ${i + 1} (${formValues.lastName})`,
      id_type: formValues.idType,
      id_number: i === 0 ? formValues.idNumber : `${formValues.idNumber}-${i + 1}`,
      emergency_contact_name: formValues.emergencyName,
      emergency_contact_phone: formValues.emergencyPhone,
    }));

    const payload = {
      schedule_id: this.scheduleId(),
      passengers: passengersPayload,
      guest_count: this.guestCount(),
      unit_price: this.unitPrice(),
      subtotal: this.unitPrice() * this.guestCount(),
      tax: this.unitPrice() * this.guestCount() * 0.1,
      total_amount: this.unitPrice() * this.guestCount() * 1.1,
    };

    // Step 1: Create atomic reservation
    this.bookingService.createBooking(payload).subscribe({
      next: (bookingRes) => {
        const bookingId = bookingRes.data?.booking_id || bookingRes.data?.id;

        if (!bookingId) {
          this.isLoading.set(false);
          this.errorMessage.set('Failed to retrieve booking confirmation ID.');
          return;
        }

        // Step 2: Initialize Paystack gateway session
        this.bookingService.initializePayment(bookingId).subscribe({
          next: (payRes) => {
            this.isLoading.set(false);
            const authUrl = payRes.data?.authorization_url || payRes.data?.payment_url;
            if (authUrl) {
              window.location.href = authUrl;
            } else {
              this.router.navigate(['/payment/confirm'], {
                queryParams: { booking_id: bookingId },
              });
            }
          },
          error: (err) => {
            this.isLoading.set(false);
            this.errorMessage.set(err.error?.message || 'Payment initialization failed.');
          },
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to complete booking reservation.');
      },
    });
  }
}
