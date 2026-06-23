import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Books } from '../../services/books';
import { Auth } from '../../../../core/services/auth';
import { Book } from '../../../../core/models/book';
import { Review } from '../../../../core/models/review';
import { ReviewForm } from '../../../reviews/components/review-form/review-form';
import { ReviewList } from '../../../reviews/components/review-list/review-list';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [RouterLink, ReviewForm, ReviewList],
  templateUrl: './book-detail.html',
})
export class BookDetail implements OnInit {
  private route        = inject(ActivatedRoute);
  private booksService = inject(Books);
  private auth         = inject(Auth);

  book      = signal<Book | null>(null);
  isLoading = signal(true);
  error     = signal<string | null>(null);

  readonly isAdmin         = this.auth.isAdmin;
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly currentUser     = this.auth.currentUser;

  // ── Computed separados para que Angular detecte cambios ──
  readonly bookReviews = computed<Review[]>(() => {
    const reviews = this.book()?.reviews;
    if (!Array.isArray(reviews)) return [];
    return reviews as Review[];
  });

  readonly userAlreadyReviewed = computed(() => {
    const userId = this.currentUser()?.id;
    if (!userId) return false;
    return this.bookReviews().some(r => r.user?.id === userId);
  });

  ngOnInit(): void {
    this.loadBook();
  }

  loadBook(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.isLoading.set(true);
    this.booksService.getById(id).subscribe({
      next: (book) => {
        this.book.set(book);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Libro no encontrado.');
        this.isLoading.set(false);
      },
    });
  }

  onReviewSubmitted(): void {
    this.loadBook();
  }

  getRatingStars(rating: number | null | undefined): string[] {
    if (!rating) return Array(5).fill('bi-star');
    return Array.from({ length: 5 }, (_, i) =>
      i < Math.round(rating) ? 'bi-star-fill' : 'bi-star'
    );
  }
}