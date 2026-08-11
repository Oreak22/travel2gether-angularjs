import { Routes } from '@angular/router';
import { authGuard, adminGuard, authRedirectGuard } from './core/guards/auth.guard';
import { PackageWizardComponent } from './features/admin/package-wizard/package-wizard.component/package-wizard.component';

export const routes: Routes = [
  // =========================================================================
  // PUBLIC & CUSTOMER WORKSPACE (Wrapped in PublicLayoutComponent)
  // =========================================================================
  {
    path: '',
    loadComponent: () =>
      import('./core/layouts/public-layout/public-layout.component/public-layout.component').then(
        (m) => m.PublicLayoutComponent,
      ),
    children: [
      // Module 1: Public & Authentication (No Guards Needed)
      {
        path: '',
        loadComponent: () =>
          import('./features/public/landing-page/landing-page.component/landing-page.component').then(
            (m) => m.LandingPageComponent,
          ),
        title: 'Journey2gether | Explore Travel Packages',
      },
      {
        path: 'packages',
        loadComponent: () =>
          import('./features/public/package-catalog/package-catalog.component/package-catalog.component').then(
            (m) => m.PackageCatalogComponent,
          ),
        title: 'Journey2gether | Travel Packages',
      },
      {
        path: 'packages/:id',
        loadComponent: () =>
          import('./features/public/package-detail/package-detail.component/package-detail.component').then(
            (m) => m.PackageDetailComponent,
          ),
        title: 'Journey2gether | Package Details',
      },
      {
        path: 'destinations',
        loadComponent: () =>
          import('./features/public/destinations/destinations.component/destinations.component').then(
            (m) => m.DestinationsComponent,
          ),
        title: 'Journey2gether | Popular Destinations',
      },
      {
        path: 'auth',
        canActivate: [authRedirectGuard],
        loadComponent: () =>
          import('./features/auth/auth-modal/auth-modal.component/auth-modal.component').then(
            (m) => m.AuthModalComponent,
          ),
        title: 'Journey2gether | Sign In & Register',
      },
      {
        path: 'auth/verify',
        loadComponent: () =>
          import('./features/auth/email-verification/email-verification.component/email-verification.component').then(
            (m) => m.EmailVerificationComponent,
          ),
        title: 'Journey2gether | Verify Email',
      },

      // Module 2: Customer Workspace (Protected by authGuard)
      {
        path: 'checkout',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/customer/checkout/checkout.component/checkout.component').then(
            (m) => m.CheckoutComponent,
          ),
        title: 'Journey2gether | Checkout',
      },
      {
        path: 'payment/confirm',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/customer/payment-confirmation/payment-confirmation.component/payment-confirmation.component').then(
            (m) => m.PaymentConfirmationComponent,
          ),
        title: 'Journey2gether | Payment Status',
      },
      {
        path: 'my-bookings',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/customer/my-bookings/my-bookings.component/my-bookings.component').then(
            (m) => m.MyBookingsComponent,
          ),
        title: 'Journey2gether | My Bookings',
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/customer/user-profile/user-profile.component/user-profile.component').then(
            (m) => m.UserProfileComponent,
          ),
        title: 'Journey2gether | Account & Security Settings',
      },
    ],
  },

  // =========================================================================
  // MODULE 3: ADMIN MANAGEMENT PORTAL
  // =========================================================================
  {
    path: 'admin',
    loadComponent: () =>
      import('./core/layouts/admin-layout/admin-layout.component/admin-layout.component').then(
        (m) => m.AdminLayoutComponent,
      ),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/admin-dashboard/admin-dashboard.component/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
        title: 'Journey2gether Admin | Dashboard',
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/admin/analytics/analytics.component/analytics.component').then(
            (m) => m.AnalyticsComponent,
          ),
        title: 'Journey2gether Admin | Revenue & Booking Analytics',
      },
      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/admin/booking-manager/booking-manager.component/booking-manager.component').then(
            (m) => m.BookingManagerComponent,
          ),
        title: 'Journey2gether Admin | Manage Bookings',
      },
      {
        path: 'packages',
        loadComponent: () =>
          import('./features/admin/package-manager/package-manager.component/package-manager.component').then(
            (m) => m.PackageManagerComponent,
          ),
        title: 'Journey2gether Admin | Package Inventory',
      },
      {
        path: 'packages/create',
        loadComponent: () =>
          import('./features/admin/package-wizard/package-wizard.component/package-wizard.component').then(
            (m) => m.PackageWizardComponent,
          ),
        title: 'Journey2gether Admin | Create Package',
      },
      {
        path: 'destinations',
        loadComponent: () =>
          import('./features/admin/destination-manager/destination-manager.component/destination-manager.component').then(
            (m) => m.DestinationManagerComponent,
          ),
        title: 'Journey2gether Admin | Destinations',
      },
      {
        path: 'media',
        loadComponent: () =>
          import('./features/admin/media-manager/media-manager.component/media-manager.component').then(
            (m) => m.MediaManagerComponent,
          ),
        title: 'Journey2gether Admin | Cloudinary Media Library',
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/admin/admin-settings/admin-settings.component/admin-settings.component').then(
            (m) => m.AdminSettingsComponent,
          ),
        title: 'Journey2gether Admin | System Settings',
      },
      { path: 'admin/packages/:id/edit', component: PackageWizardComponent }, // Enables edit route
    ],
  },

  // Fallback Wildcard Route
  {
    path: 'not-found',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then((m) => m.NotFoundComponent),
    title: 'Journey2gether | Not Found',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
