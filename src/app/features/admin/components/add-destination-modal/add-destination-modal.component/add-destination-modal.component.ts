import { Component, EventEmitter, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonComponent } from '../../../../../shared/components/button/button.component/button.component';
import { InputComponent } from '../../../../../shared/components/input/input.component/input.component';
import { DestinationService } from '../../../../../core/services/destination.service';

@Component({
  selector: 'app-add-destination-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ButtonComponent,
    InputComponent,
  ],
  templateUrl: './add-destination-modal.component.html',
})
export class AddDestinationModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private destinationService = inject(DestinationService);

  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  regionOptions = [
    'Europe',
    'Asia',
    'North America',
    'South America',
    'Africa',
    'Oceania',
    'Middle East',
  ];

  destinationForm: FormGroup = this.fb.group({
    city: ['', Validators.required],
    country: ['', Validators.required],
    regionTag: ['Europe', Validators.required],
    image_url: ['', Validators.required],
    description: ['', Validators.required],
  });

  submitForm(): void {
    if (this.destinationForm.invalid) {
      this.destinationForm.markAllAsTouched();
      this.errorMessage.set('Please fill in all required fields.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formVal = this.destinationForm.value;
    const payload = {
      name: formVal.city,
      city: formVal.city,
      country: formVal.country,
      region: formVal.regionTag,
      region_tag: formVal.regionTag,
      image_url: formVal.image_url,
      thumbnail_url: formVal.image_url,
      description: formVal.description,
    };

    this.destinationService.createDestination(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.created.emit();
        this.close.emit();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to create destination.');
      },
    });
  }

  onClose(): void {
    this.close.emit();
  }
}
