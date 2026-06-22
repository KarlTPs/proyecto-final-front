import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserReviews } from './user-reviews';

describe('UserReviews', () => {
  let component: UserReviews;
  let fixture: ComponentFixture<UserReviews>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserReviews],
    }).compileComponents();

    fixture = TestBed.createComponent(UserReviews);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
