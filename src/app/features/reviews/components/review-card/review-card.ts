import { Component, inject, signal, input, output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Reviews } from '../../services/reviews';
import { Review } from '../../../../core/models/review';
import { DatePipe } from '@angular/common'; 

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './review-card.html',
})
export class ReviewCard {
  private fb      = inject(FormBuilder);
  private reviews = inject(Reviews);

  // ── Inputs ──
  review        = input.required<Review>();
  currentUserId = input<string>('');
  isAdmin       = input<boolean>(false);

  // ── Outputs ──
  reviewDeleted = output<string>();
  reviewUpdated = output<Review>();

  // ── Signals ──
  isEditing    = signal(false);
  isDeleting   = signal(false);
  isLoading    = signal(false);
  errorMessage = signal<string | null>(null);
  hoveredStar  = signal(0);

  readonly isOwner = () => this.review().user.id === this.currentUserId();
  readonly canEdit = () => this.isOwner();
  readonly canDelete = () => this.isOwner() || this.isAdmin();

  form = this.fb.group({
    rating:  [0, [Validators.required, Validators.min(1)]],
    comment: ['', Validators.maxLength(1000)],
  });

  starsArray = [1, 2, 3, 4, 5];

  startEditing(): void {
    this.form.patchValue({
      rating:  this.review().rating,
      comment: this.review().comment ?? '',
    });
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
    this.errorMessage.set(null);
  }

  setRating(value: number): void {
    this.form.patchValue({ rating: value });
  }

  saveEdit(): void {
    if (this.form.invalid) return;
    this.isLoading.set(true);

    this.reviews.update(this.review().id, {
      rating:  this.form.value.rating!,
      comment: this.form.value.comment || undefined,
    }).subscribe({
      next: (updated) => {
        this.isEditing.set(false);
        this.isLoading.set(false);
        this.reviewUpdated.emit(updated);
      },
      error: () => {
        this.errorMessage.set('Error al actualizar la reseña.');
        this.isLoading.set(false);
      },
    });
  }

  confirmDelete(): void {
    this.isDeleting.set(true);
  }

  cancelDelete(): void {
    this.isDeleting.set(false);
  }

  deleteReview(): void {
    this.isLoading.set(true);
    this.reviews.delete(this.review().id).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.reviewDeleted.emit(this.review().id);
      },
      error: () => {
        this.errorMessage.set('Error al eliminar la reseña.');
        this.isLoading.set(false);
        this.isDeleting.set(false);
      },
    });
  }

  get currentEditRating(): number {
    return this.hoveredStar() || (this.form.value.rating ?? 0);
  }
}