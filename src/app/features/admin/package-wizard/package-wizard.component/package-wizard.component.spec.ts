import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageWizardComponent } from './package-wizard.component';

describe('PackageWizardComponent', () => {
  let component: PackageWizardComponent;
  let fixture: ComponentFixture<PackageWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackageWizardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PackageWizardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
