import { Component, input, signal, computed, OnChanges } from '@angular/core';
import { Review } from '../../../../core/models/review';
import { ReviewCard } from '../review-card/review-card';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [ReviewCard],
  templateUrl: './review-list.html',
})
export class ReviewList implements OnChanges {
  // ── Inputs ──
  reviews       = input<Review[]>([]);
  bookId        = input<string>('');
  currentUserId = input<string>('');
  isAdmin       = input<boolean>(false);

  // ── Signals ──
  localReviews = signal<Review[]>([]);

  ngOnChanges(): void {
    this.localReviews.set(this.reviews());
  }

  onReviewDeleted(id: string): void {
    this.localReviews.update(list => list.filter(r => r.id !== id));
  }

  onReviewUpdated(updated: Review): void {
    this.localReviews.update(list =>
      list.map(r => r.id === updated.id ? updated : r)
    );
  }
}