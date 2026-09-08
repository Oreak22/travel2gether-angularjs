import { Component, signal, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonComponent } from '../../../../shared/components/button/button.component/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component/input.component';
import { AuthService, User } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

declare const google: any;
declare const AppleID: any;

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
export class AuthModalComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

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
  APPLE_CLIENT_ID = environment.apple_client_id;
  GOOGLE_CLIENT_ID = environment.google_client_id;
  ngOnInit(): void {
    if (this.isBrowser) {
      console.log('woked');
      this.initGoogleAuth();
      this.initAppleAuth();
    }
  }
  private initAppleAuth(): void {
    const checkAppleLoaded = setInterval(() => {
      if (typeof AppleID !== 'undefined') {
        clearInterval(checkAppleLoaded);
        AppleID.auth.init({
          clientId: this.APPLE_CLIENT_ID,
          scope: 'name email',
          redirectURI: 'https://yourdomain.com/auth/apple/callback', // Registered redirect URI in Apple Developer Console
          usePopup: true,
        });
      }
    }, 100);
  }
  private handleGoogleCredential(idToken: string): void {
    this.isLoading.set(true);
    this.authError.set(null);

    this.authService.googleLogin(idToken).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.handleAuthSuccess(response.data?.user);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.authError.set(
          err.error?.message || 'Unable to sign in with Google. Please try again.',
        );
      },
    });
  }
  /**
   * Initialize Google Identity Services SDK callback
   */
  // private initGoogleAuth(): void {
  //   if (typeof google !== 'undefined' && google.accounts) {
  //     google.accounts.id.initialize({
  //       client_id: this.GOOGLE_CLIENT_ID,
  //       callback: (response: any) => this.handleGoogleCredential(response.credential),
  //     });
  //   }
  // }
  private initGoogleAuth(): void {
    const checkGoogleLoaded = setInterval(() => {
      if (typeof google !== 'undefined' && google.accounts) {
        clearInterval(checkGoogleLoaded);

        // Enable FedCM explicitly
        google.accounts.id.initialize({
          client_id: this.GOOGLE_CLIENT_ID,
          callback: (response: any) => this.handleGoogleCredential(response.credential),
          use_fedcm_for_prompt: true, // Opt-in to FedCM
        });
      }
    }, 100);
  }
  /**
   * Handle Google OAuth Authentication
   */
  loginWithGoogle(): void {
    if (!this.isBrowser) return;

    if (typeof google === 'undefined' || !google.accounts) {
      this.authError.set('Google Sign-In SDK is still loading. Please try again in a moment.');
      return;
    }

    // Attempt prompt
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.warn('One Tap suppressed or skipped:', notification.getNotDisplayedReason());

        // Fallback: If One Tap is suppressed, open Google's account selector
        google.accounts.id.renderButton(document.getElementById('hidden-google-btn')!, {
          type: 'standard',
          size: 'large',
        });

        // Trigger click on rendered fallback button
        const hiddenBtn = document
          .getElementById('hidden-google-btn')
          ?.querySelector('div[role=button]') as HTMLElement;
        if (hiddenBtn) {
          hiddenBtn.click();
        } else {
          this.authError.set(
            'Please enable third-party cookies or popups in your browser settings.',
          );
        }
      }
    });
  }

  /**
   * Trigger Apple Sign-In SDK / Flow
   */
  async loginWithApple(): Promise<void> {
    if (!this.isBrowser) return;

    try {
      if (typeof AppleID === 'undefined') {
        this.authError.set('Apple Sign-In SDK is not loaded.');
        return;
      }

      // Trigger Apple native web prompt
      const data = await AppleID.auth.signIn();
      const identityToken = data.authorization.id_token;

      // Capture name if provided (Apple only returns this on FIRST sign-in)
      let fullName: string | undefined;
      if (data.user?.name) {
        fullName = `${data.user.name.firstName || ''} ${data.user.name.lastName || ''}`.trim();
      }

      this.executeAppleAuth(identityToken, fullName);
    } catch (error: any) {
      if (error?.error !== 'popup_closed_by_user') {
        this.authError.set('Apple Sign-In failed or was cancelled.');
      }
    }
  }

  /**
   * Send Apple credentials to Backend
   */
  private executeAppleAuth(identityToken: string, fullName?: string): void {
    this.isLoading.set(true);
    this.authError.set(null);

    this.authService.appleLogin({ identityToken, fullName }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.handleAuthSuccess(response.data?.user);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.authError.set(err.error?.message || 'Unable to sign in with Apple. Please try again.');
      },
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
          this.handleAuthSuccess(response.data?.user);
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

  /**
   * Centralized navigation logic upon successful authentication
   */
  private handleAuthSuccess(user: User | undefined): void {
    if (!user) {
      this.authError.set('Authentication succeeded but user data is missing. Please try again.');
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
  }
}
