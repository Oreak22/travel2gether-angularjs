import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDestinationModalComponent } from './add-destination-modal.component';

describe('AddDestinationModalComponent', () => {
  let component: AddDestinationModalComponent;
  let fixture: ComponentFixture<AddDestinationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDestinationModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddDestinationModalComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
