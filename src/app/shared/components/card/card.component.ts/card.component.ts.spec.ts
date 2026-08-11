import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardComponentTs } from './card.component.ts';

describe('CardComponentTs', () => {
  let component: CardComponentTs;
  let fixture: ComponentFixture<CardComponentTs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponentTs],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponentTs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
