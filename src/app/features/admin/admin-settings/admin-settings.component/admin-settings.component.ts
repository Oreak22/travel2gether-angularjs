import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { InputComponent } from '../../../../shared/components/input/input.component/input.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component/button.component';
import { HttpClient } from '@angular/common/http';
// import environment from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-settings.component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ButtonComponent,
    InputComponent,
  ],
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.css',
})
export class AdminSettingsComponent implements OnInit {
  // private settingsApiUrl = `${environment.apiUrl}/admin/settings`;

  settingsForm: FormGroup;
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
  ) {
    this.settingsForm = this.fb.group({
      paystackPublicKey: ['', Validators.required],
      paystackSecretKey: ['', Validators.required],
      currency: ['USD ($)', Validators.required],
      supportEmail: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    // this.fetchSettings();
  }

  // fetchSettings(): void {
  //   this.isLoading.set(true);
  //   this.http.get<{ status: string; data: any }>(this.settingsApiUrl).subscribe({
  //     next: (res) => {
  //       const settings = res.data || {};
  //       this.settingsForm.patchValue({
  //         paystackPublicKey: settings.paystack_public_key || settings.paystackPublicKey || '',
  //         paystackSecretKey: settings.paystack_secret_key || settings.paystackSecretKey || '',
  //         currency: settings.currency || 'USD ($)',
  //         supportEmail:
  //           settings.support_email || settings.supportEmail || 'support@journey2gether.com',
  //       });
  //       this.isLoading.set(false);
  //     },
  //     error: () => {
  //       // Fallback default values if database table is initially empty

  //       this.isLoading.set(false);
  //     },
  //   });
  // }

  saveSettings(): void {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const formValues = this.settingsForm.value;
    const payload = {
      paystack_public_key: formValues.paystackPublicKey,
      paystack_secret_key: formValues.paystackSecretKey,
      currency: formValues.currency,
      support_email: formValues.supportEmail,
    };

    // this.http.post<{ status: string; message: string }>(this.settingsApiUrl, payload).subscribe({
    //   next: (res) => {
    //     this.isSaving.set(false);
    //     this.successMessage.set(res.message || 'Settings saved successfully!');
    //   },
    //   error: (err) => {
    //     this.isSaving.set(false);
    //     this.errorMessage.set(err.error?.message || 'Failed to save settings.');
    //   },
    // });
  }
}
