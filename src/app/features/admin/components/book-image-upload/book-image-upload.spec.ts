import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookImageUpload } from './book-image-upload';

describe('BookImageUpload', () => {
  let component: BookImageUpload;
  let fixture: ComponentFixture<BookImageUpload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookImageUpload],
    }).compileComponents();

    fixture = TestBed.createComponent(BookImageUpload);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
