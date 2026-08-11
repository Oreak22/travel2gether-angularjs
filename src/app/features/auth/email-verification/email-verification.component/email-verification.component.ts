import { Component, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonComponent } from '../../../../shared/components/button/button.component/button.component';
import { AuthService } from '../../../../core/services/auth.service';
@Component({
  selector: 'app-email-verification.component',
  imports: [CommonModule, LucideAngularModule, ButtonComponent],
  templateUrl: './email-verification.component.html',
  styleUrl: './email-verification.component.css',
})
export class EmailVerificationComponent implements OnDestroy {
  otpDigits = ['', '', '', '', '', ''];
  resendTimer = signal(60);
  isVerifying = signal(false);
  errorMessage = signal<string | null>(null);
  private timerInterval: any;

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {
    this.startTimer();
  }

  get email(): string | null {
    return this.authService.currentUser()?.email || null;
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.resendTimer() > 0) {
        this.resendTimer.update((v) => v - 1);
      } else {
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '').slice(0, 1);
    input.value = value;
    this.otpDigits[index] = value;

    if (value && index < 5) {
      const nextInput = input.nextElementSibling as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  }

  onBackspace(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.value && index > 0) {
      const prevInput = input.previousElementSibling as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  }
  restartTimer(): void {
    this.resendTimer.set(60);
    if (!this.email) return this.errorMessage.set('Logout and try again');
    this.authService.resendMail({ email: this.email }).subscribe({
      next: (response) => {
        this.errorMessage.set(null);
        this.startTimer();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Resend mail failed, try again');
      },
    });
    this.errorMessage.set(null);
    this.startTimer();
  }
  verifyCode(): void {
    const otp = this.otpDigits.join('');
    if (otp.length !== 6) {
      this.errorMessage.set('Please enter the 6-digit verification code.');
      return;
    }

    if (!this.email) {
      this.errorMessage.set('Your account email is missing. Please sign in again.');
      return;
    }

    this.errorMessage.set(null);
    this.isVerifying.set(true);

    this.authService.verifyOtp({ email: this.email, otp }).subscribe({
      next: (response) => {
        this.isVerifying.set(false);
        if (response.status === 'success') {
          this.router.navigate(['/']);
        } else {
          this.errorMessage.set(response.message || 'Verification failed. Please try again.');
        }
      },
      error: (err) => {
        this.isVerifying.set(false);
        this.errorMessage.set(err.error?.message || 'Verification failed. Please try again.');
      },
    });
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }
}
