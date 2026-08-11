import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { PublicLayoutComponent } from './public-layout.component';

describe('PublicLayoutComponent', () => {
  let component: PublicLayoutComponent;
  let fixture: ComponentFixture<PublicLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicLayoutComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicLayoutComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the packages dropdown open and closed', () => {
    expect(component.activeDropdown()).toBeNull();

    component.toggleDropdown('packages');
    expect(component.activeDropdown()).toBe('packages');

    component.toggleDropdown('packages');
    expect(component.activeDropdown()).toBeNull();
  });

  it('should close the mobile menu and dropdowns together', () => {
    component.toggleMobileMenu();
    component.toggleDropdown('packages');

    expect(component.isMobileMenuOpen()).toBeTrue();
    expect(component.activeDropdown()).toBe('packages');

    component.closeMobileMenu();

    expect(component.isMobileMenuOpen()).toBeFalse();
    expect(component.activeDropdown()).toBeNull();
  });
});
