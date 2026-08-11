import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonComponent } from '../../../../shared/components/button/button.component/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component/input.component';
import { PackageService, PackageStatus } from '../../../../core/services/package.service';
import { DestinationService } from '../../../../core/services/destination.service';

interface DestinationOption {
  id: number;
  name: string;
  country: string;
}

interface MediaAsset {
  id: number;
  file_url: string;
  file_name: string;
}

@Component({
  selector: 'app-package-wizard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule,
    ButtonComponent,
    InputComponent,
  ],
  templateUrl: './package-wizard.component.html',
  styleUrl: './package-wizard.component.css',
})
export class PackageWizardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private packageService = inject(PackageService);
  private destinationService = inject(DestinationService);

  currentStep = signal<number>(1);
  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  isEditMode = signal<boolean>(false);

  destinations = signal<DestinationOption[]>([]);
  mediaLibrary = signal<MediaAsset[]>([]);
  createdPackageId = signal<number | null>(null);
  packageStatus = signal<PackageStatus>('draft');

  // Media & Drag-and-Drop state
  selectedImageFile = signal<File | null>(null);
  imagePreviewUrl = signal<string | null>(null);
  isDragging = signal<boolean>(false);
  isUploadingMedia = signal<boolean>(false);

  steps = [
    { number: 1, label: 'Basics' },
    { number: 2, label: 'Schedules' },
    { number: 3, label: 'Itinerary' },
    { number: 4, label: 'Publish' },
  ];

  // STEP 1 Form
  stepOneForm: FormGroup = this.fb.group({
    destination_id: ['', Validators.required],
    title: ['', Validators.required],
    slug: [''],
    basePrice: ['', [Validators.required, Validators.min(1)]],
    duration_days: [3, [Validators.required, Validators.min(1)]],
    duration_nights: [2, [Validators.required, Validators.min(0)]],
    description: ['', Validators.required],
  });

  // STEP 2 Form
  scheduleForm: FormGroup = this.fb.group({
    start_date: ['', Validators.required],
    end_date: ['', Validators.required],
    max_capacity: [30, [Validators.required, Validators.min(1)]],
  });

  // STEP 3 Form Array
  itineraryForm: FormGroup = this.fb.group({
    days: this.fb.array([]),
  });

  get itineraryDays(): FormArray {
    return this.itineraryForm.get('days') as FormArray;
  }

  ngOnInit(): void {
    this.fetchDestinations();
    this.fetchMediaLibrary();
    this.checkEditMode();
  }

  checkEditMode(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const pkgId = parseInt(idParam, 10);
      if (pkgId) {
        this.isEditMode.set(true);
        this.createdPackageId.set(pkgId);
        this.loadPackageForEdit(pkgId);
        return;
      }
    }
    this.addItineraryDay();
  }

  loadPackageForEdit(pkgId: number): void {
    this.isSubmitting.set(true);
    this.packageService.getPackageById(pkgId).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        const pkg = res.data;
        if (!pkg) return;

        this.packageStatus.set(pkg.status || 'draft');

        // Populate Step 1 Form
        this.stepOneForm.patchValue({
          destination_id: pkg.destination?.id || pkg.destination_id,
          title: pkg.title,
          basePrice: pkg.base_price,
          duration_days: pkg.duration_days,
          duration_nights: pkg.duration_nights || Math.max(0, pkg.duration_days - 1),
          description: pkg.description,
        });

        // Populate Cover Image
        if (pkg.photos && pkg.photos.length > 0) {
          const cover = pkg.photos.find((p: any) => p.photo_type === 'cover') || pkg.photos[0];
          if (cover?.photo_url) {
            this.imagePreviewUrl.set(cover.photo_url);
          }
        }

        // Populate Itineraries
        if (pkg.itineraries && pkg.itineraries.length > 0) {
          this.itineraryDays.clear();
          pkg.itineraries.forEach((it: any) => {
            this.itineraryDays.push(
              this.fb.group({
                day_number: [it.day_number],
                title: [it.title, Validators.required],
                description: [it.description, Validators.required],
              }),
            );
          });
        } else {
          this.addItineraryDay();
        }
      },
      error: () => {
        this.isSubmitting.set(false);
        this.errorMessage.set('Failed to load package details for editing.');
      },
    });
  }

  fetchDestinations(): void {
    this.destinationService.getPublicDestinations().subscribe({
      next: (res) => {
        const list = (res.data || []).map((d: any) => ({
          id: d.id,
          name: d.name || d.city,
          country: d.country,
        }));
        this.destinations.set(list);
      },
      error: () => this.errorMessage.set('Could not load destinations list.'),
    });
  }

  fetchMediaLibrary(): void {
    this.destinationService.getMediaAssets().subscribe({
      next: (res) => {
        if (res.data) {
          this.mediaLibrary.set(res.data);
        }
      },
      error: () => {},
    });
  }

  // --- Step 3: Itinerary Builders ---
  addItineraryDay(): void {
    const dayGroup = this.fb.group({
      day_number: [this.itineraryDays.length + 1],
      title: ['', Validators.required],
      description: ['', Validators.required],
    });
    this.itineraryDays.push(dayGroup);
  }

  removeItineraryDay(index: number): void {
    if (this.itineraryDays.length > 1) {
      this.itineraryDays.removeAt(index);
      this.itineraryDays.controls.forEach((ctrl, idx) => {
        ctrl.patchValue({ day_number: idx + 1 });
      });
    }
  }

  // --- Step 4: Media Upload ---
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.uploadFileAsset(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadFileAsset(input.files[0]);
    }
  }

  uploadFileAsset(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('Please select a valid image file.');
      return;
    }

    this.selectedImageFile.set(file);
    this.errorMessage.set(null);

    // 1. Immediate local base64 preview for faster UX feedback
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviewUrl.set(reader.result as string);
    };
    reader.readAsDataURL(file);

    const pkgId = this.createdPackageId();
    if (!pkgId) {
      this.errorMessage.set('Please complete Step 1 to create the package before uploading media.');
      return;
    }

    // 2. Direct binary file upload to PHP -> Cloudinary
    this.isUploadingMedia.set(true);
    this.uploadAndAttachPhotoFile(pkgId, file);
  }

  /**
   * Upload binary file directly to PHP addPhoto endpoint
   */
  uploadAndAttachPhotoFile(packageId: number, file: File): void {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('photo_type', 'cover');

    this.packageService.addPhoto(packageId, formData).subscribe({
      next: (res: any) => {
        this.isUploadingMedia.set(false);
        const serverUrl = res.data?.photo_url;
        if (serverUrl) {
          this.imagePreviewUrl.set(serverUrl);
        }
        this.fetchMediaLibrary();
      },
      error: (err) => {
        this.isUploadingMedia.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to upload cover photo to server.');
      },
    });
  }

  /**
   * Select an existing asset from the media library
   */
  selectFromLibrary(asset: MediaAsset): void {
    const pkgId = this.createdPackageId();
    if (!pkgId) return;

    this.imagePreviewUrl.set(asset.file_url);

    // Fallback JSON upload for library URLs
    this.packageService
      .addPhoto(pkgId, { photo_url: asset.file_url, photo_type: 'cover' })
      .subscribe({
        error: (err) =>
          this.errorMessage.set(
            err?.error?.message || 'Failed to attach selected photo from library.',
          ),
      });
  }
  

  removeImage(): void {
    this.selectedImageFile.set(null);
    this.imagePreviewUrl.set(null);
  }

  // --- Step Navigation & Submissions ---
  nextStep(): void {
    this.errorMessage.set(null);

    if (this.currentStep() === 1) {
      if (this.stepOneForm.invalid) {
        this.stepOneForm.markAllAsTouched();
        this.errorMessage.set('Please complete all required basic fields.');
        return;
      }
      this.submitStepOne();
    } else if (this.currentStep() === 2) {
      if (this.scheduleForm.invalid) {
        this.scheduleForm.markAllAsTouched();
        this.errorMessage.set('Please select valid start/end dates.');
        return;
      }
      this.submitStepTwo();
    } else if (this.currentStep() === 3) {
      if (this.itineraryForm.invalid) {
        this.itineraryForm.markAllAsTouched();
        this.errorMessage.set('Please fill out all day details.');
        return;
      }
      this.submitStepThree();
    }
  }

  prevStep(): void {
    this.errorMessage.set(null);
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
    }
  }

  submitStepOne(): void {
    this.isSubmitting.set(true);
    const val = this.stepOneForm.value;

    const payload = {
      destination_id: parseInt(val.destination_id, 10),
      title: val.title,
      slug: val.slug || val.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: val.description,
      base_price: parseFloat(val.basePrice),
      duration_days: parseInt(val.duration_days, 10),
      duration_nights: parseInt(val.duration_nights, 10),
    };

    const pkgId = this.createdPackageId();

    if (this.isEditMode() && pkgId) {
      // Update existing package
      this.packageService.updatePackage(pkgId, payload).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.currentStep.set(2);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to update package details.');
        },
      });
    } else {
      // Create new package
      this.packageService.createPackage(payload).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          const newId = res.data?.id || res.data?.package_id;
          if (newId) this.createdPackageId.set(newId);
          this.currentStep.set(2);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to create package basics.');
        },
      });
    }
  }

  submitStepTwo(): void {
    const pkgId = this.createdPackageId();
    if (!pkgId) {
      this.currentStep.set(3);
      return;
    }

    this.isSubmitting.set(true);
    this.packageService.addSchedule(pkgId, this.scheduleForm.value).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.currentStep.set(3);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to add departure schedule.');
      },
    });
  }

  submitStepThree(): void {
    const pkgId = this.createdPackageId();
    const daysData = this.itineraryForm.value.days;

    if (!pkgId || daysData.length === 0) {
      this.currentStep.set(4);
      return;
    }

    this.isSubmitting.set(true);
    this.packageService.addItinerary(pkgId, { days: daysData }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.currentStep.set(4);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to save itinerary details.');
      },
    });
  }

  // --- Status & Deletion Actions ---
  publishFinalPackage(): void {
    const pkgId = this.createdPackageId();
    if (!pkgId) {
      this.router.navigate(['/admin/packages']);
      return;
    }

    this.isSubmitting.set(true);
    this.packageService.publishPackage(pkgId).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/admin/packages']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to publish package.');
      },
    });
  }

  changeStatus(status: PackageStatus): void {
    const pkgId = this.createdPackageId();
    if (!pkgId) return;

    this.isSubmitting.set(true);
    this.packageService.updateStatus(pkgId, status).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.packageStatus.set(status);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to update package status.');
      },
    });
  }

  deletePackage(): void {
    const pkgId = this.createdPackageId();
    if (!pkgId) return;

    if (!confirm('Are you sure you want to delete this package?')) return;

    this.isSubmitting.set(true);
    this.packageService.deletePackage(pkgId).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/admin/packages']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to delete package.');
      },
    });
  }
}
