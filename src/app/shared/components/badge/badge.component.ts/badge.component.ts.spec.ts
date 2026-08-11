import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BadgeComponentTs } from './badge.component.ts';

describe('BadgeComponentTs', () => {
  let component: BadgeComponentTs;
  let fixture: ComponentFixture<BadgeComponentTs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeComponentTs],
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeComponentTs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
