# Journey2gether — Application Development Manifest

## Application Overview

- **App Name:** Journey2gether
- **Framework:** Angular (Latest Standalone Architecture)
- **Styling:** Tailwind CSS + Angular CDK
- **Icons:** @lucide/angular
- **Notifications:** ngx-sonner
- **Backend API:** PHP REST API
- **Design Tokens:**
  - Primary: `#0F172A`
  - Accent: `#0EA5E9`
  - Surface: `#F8FAFC`

---

## Development Progress Tracker

### Phase 1: Setup, Layout Shells & Core Primitives

- [ ] Dependencies Installed (`@angular/cdk`, `@lucide/angular`, `ngx-sonner`, `tailwindcss`)
- [ ] `tailwind.config.js` configured with custom project palette
- [ ] Core UI Component Primitives:
  - [ ] `ButtonComponent`
  - [ ] `InputComponent` / `TextareaComponent`
  - [ ] `BadgeComponent`
  - [ ] `CardComponent`
  - [ ] `ModalComponent` / `DrawerComponent`
  - [ ] `TabsComponent`
  - [ ] `TableComponent`
- [ ] Shell Layout Components:
  - [ ] `PublicLayoutComponent` (Header + Footer + Mobile Nav)
  - [ ] `AdminLayoutComponent` (Dark Sidebar + Header)

---

### Phase 2: Module 1 — Public & Authentication

- [ ] **Screen 1.1:** Landing & Discover Page
- [ ] **Screen 1.2:** Package Catalog & Search/Filters Panel
- [ ] **Screen 1.3:** Package Detail Page & Interactive Itinerary
- [ ] **Screen 1.4:** User Authentication Modal (Login / Register)
- [ ] **Screen 1.5:** Email Verification & 6-Digit OTP View

---

### Phase 3: Module 2 — Customer Workspace

- [ ] **Screen 2.1:** Checkout & Guest Selection Flow
- [ ] **Screen 2.2:** Payment Processing & Confirmation
- [ ] **Screen 2.3:** My Bookings Management Dashboard
- [ ] **Screen 2.4:** Booking Detail & Digital Receipt Modal
- [ ] **Screen 2.5:** Profile, Security & Preferences Settings

---

### Phase 4: Module 3 — Admin Portal & Content Management

- [ ] **Screen 3.1:** Admin Analytics Dashboard & Recent Bookings Data Table
- [ ] **Screen 3.2:** Package Inventory & Status Toggle Manager
- [ ] **Screen 3.3:** Package Creation Wizard (4 Steps):
  - [ ] Step 1: Package Basics Form
  - [ ] Step 2: Schedule & Seat Allocation Builder
  - [ ] Step 3: Dynamic Day-by-Day Itinerary Builder
  - [ ] Step 4: Media Upload & Cloudinary Asset Zone
- [ ] **Screen 3.4:** Destination & Media Library Portal

---

### Phase 5: Routing & Final Polish

- [ ] Angular Router route configurations
- [ ] Responsive design checks across desktop and mobile
- [ ] Micro-animations (modal drop-ins, drawer transitions)
