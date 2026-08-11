import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonComponent } from '../../../../shared/components/button/button.component/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component/input.component';
import { AuthService } from '../../../../core/services/auth.service';
@Component({
  selector: 'app-auth-modal.component',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule,
    ButtonComponent,
    InputComponent,
  ],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.css',
})
export class AuthModalComponent {
  activeTab = signal<'login' | 'register'>('login');
  showPassword = signal(false);
  isLoading = signal(false);
  authError = signal<string | null>(null);

  authForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {
    this.authForm = this.fb.group({
      fullName: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  switchTab(tab: 'login' | 'register'): void {
    this.authError.set(null);
    this.activeTab.set(tab);

    const fullNameControl = this.authForm.get('fullName');
    if (fullNameControl) {
      if (tab === 'register') {
        fullNameControl.setValidators([Validators.required]);
      } else {
        fullNameControl.clearValidators();
      }
      fullNameControl.updateValueAndValidity();
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.authForm.get(controlName);
    if (!control || !control.touched || !control.errors) {
      return '';
    }

    if (control.hasError('required')) {
      return 'This field is required.';
    }
    if (control.hasError('email')) {
      return 'Please enter a valid email address.';
    }
    if (control.hasError('minlength')) {
      return `Password must be at least ${control.errors?.['minlength']?.requiredLength} characters.`;
    }
    return 'Please correct this field.';
  }

  onSubmit(): void {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    this.authError.set(null);
    this.isLoading.set(true);

    if (this.activeTab() === 'login') {
      const credentials = {
        email: this.authForm.value.email,
        password: this.authForm.value.password,
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          const user = response.data?.user;
          console.log(response.data?.user);
          if (!user) {
            this.authError.set('Login succeeded but user data is missing. Please try again.');
            return;
          }

          if (user.is_email_verified === false || user.is_email_verified === 0) {
            this.router.navigate(['/auth/verify']);
            return;
          }

          if (user.role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
            return;
          }

          this.router.navigate(['/packages']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.authError.set(
            err.error?.message || 'Unable to sign in. Please check your credentials and try again.',
          );
        },
      });
      return;
    }

    const payload = {
      full_name: this.authForm.value.fullName,
      email: this.authForm.value.email,
      password: this.authForm.value.password,
    };

    this.authService.register(payload).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.data?.user) {
          this.router.navigate(['/auth/verify']);
        } else {
          this.authError.set(
            response.message || 'Registration completed. Please verify your email.',
          );
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.authError.set(
          err.error?.message || 'Registration failed. Please check your details and try again.',
        );
      },
    });
  }
}
