import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestinationManagerComponent } from './destination-manager.component';

describe('DestinationManagerComponent', () => {
  let component: DestinationManagerComponent;
  let fixture: ComponentFixture<DestinationManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DestinationManagerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DestinationManagerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
