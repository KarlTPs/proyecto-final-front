import {
  Component, inject, signal, input, output,
  computed, OnChanges, SimpleChanges
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Reviews, CreateReviewDto } from '../../services/reviews';
import { Review } from '../../../../core/models/review';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './review-form.html',
})
export class ReviewForm implements OnChanges {
  private fb      = inject(FormBuilder);
  private reviews = inject(Reviews);

  bookId          = input.required<string>();
  existingReviews = input<Review[]>([]);
  currentUserId   = input<string>('');

  reviewSubmitted = output<void>();

  isLoading      = signal(false);
  errorMessage   = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isEditing      = signal(false);
  editingId      = signal<string | null>(null);
  hoveredStar    = signal(0);

  readonly userReview = computed(() =>
    this.existingReviews().find(r => r.user?.id === this.currentUserId())
  );

  readonly alreadyReviewed = computed(() =>
    !!this.userReview() && !this.isEditing()
  );

  form = this.fb.group({
    rating:  [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', Validators.maxLength(1000)],
  });

  get rating()  { return this.form.get('rating')!; }
  get comment() { return this.form.get('comment')!; }

  get currentRating(): number {
    return this.hoveredStar() || (this.rating.value ?? 0);
  }

  // ── ngOnChanges en lugar de ngOnInit ──
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['existingReviews']) {
      const existing = this.userReview();
      if (existing) {
        this.form.patchValue({
          rating:  existing.rating,
          comment: existing.comment ?? '',
        });
        this.editingId.set(existing.id);
      } else {
        this.editingId.set(null);
        this.form.patchValue({ rating: 0, comment: '' });
      }
    }
  }

  setRating(value: number): void {
    this.form.patchValue({ rating: value });
  }

  startEditing(): void {
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
    const existing = this.userReview();
    if (existing) {
      this.form.patchValue({
        rating:  existing.rating,
        comment: existing.comment ?? '',
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const dto: CreateReviewDto = {
      rating:  this.form.value.rating!,
      comment: this.form.value.comment || undefined,
    };

    const request$ = this.editingId()
      ? this.reviews.update(this.editingId()!, dto)
      : this.reviews.create(this.bookId(), dto);

    request$.subscribe({
      next: () => {
        this.successMessage.set(
          this.editingId() ? 'Reseña actualizada.' : 'Reseña publicada.'
        );
        this.isEditing.set(false);
        this.isLoading.set(false);
        this.reviewSubmitted.emit();
      },
      error: (err) => {
        this.errorMessage.set(
          err.status === 409
            ? 'Ya tienes una reseña para este libro.'
            : 'Error al guardar la reseña.'
        );
        this.isLoading.set(false);
      },
    });
  }

  starsArray = [1, 2, 3, 4, 5];
}