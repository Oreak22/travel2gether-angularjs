import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PackageManagerComponent } from './package-manager.component';

describe('PackageManagerComponent', () => {
  let component: PackageManagerComponent;
  let fixture: ComponentFixture<PackageManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackageManagerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PackageManagerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
