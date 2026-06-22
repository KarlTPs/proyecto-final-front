import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Affinity } from './affinity';

describe('Affinity', () => {
  let component: Affinity;
  let fixture: ComponentFixture<Affinity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Affinity],
    }).compileComponents();

    fixture = TestBed.createComponent(Affinity);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
