import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Books } from '../../../books/services/books';
import { Reviews } from '../../../reviews/services/reviews';
import { Book } from '../../../../core/models/book';
import { Review } from '../../../../core/models/review';
import { catchError, forkJoin, of } from 'rxjs';

interface BookWithReviews extends Book {
  reviews: Review[];
}

@Component({
  selector: 'app-review-moderation',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './review-moderation.html',
})
export class ReviewModeration implements OnInit {
  private booksService   = inject(Books);
  private reviewsService = inject(Reviews);

  booksWithReviews = signal<BookWithReviews[]>([]);
  isLoading        = signal(true);
  error            = signal<string | null>(null);

  // Modal de confirmación
  deletingReview = signal<{ review: Review; bookTitle: string } | null>(null);
  isDeleting     = signal(false);
  deleteError    = signal<string | null>(null);

  ngOnInit(): void {
    this.loadBooksWithReviews();
  }

  private loadBooksWithReviews(): void {
  this.isLoading.set(true);

  this.booksService.getAll({ page: 1, limit: 50 }).subscribe({
    next: (res) => {
      if (res.data.length === 0) {
        this.booksWithReviews.set([]);
        this.isLoading.set(false);
        return;
      }

      // Cargar todos los detalles en paralelo de forma controlada
      const requests = res.data.map(book =>
        this.booksService.getById(book.id).pipe(
          catchError(() => of(null)) // Si falla uno, no bloquear los demás
        )
      );

      forkJoin(requests).subscribe(details => {
        const withReviews = details
          .filter((b): b is Book & { reviews: Review[] } =>
            b !== null && Array.isArray(b.reviews) && b.reviews.length > 0
          );
        this.booksWithReviews.set(withReviews);
        this.isLoading.set(false);
      });
    },
    error: () => {
      this.error.set('Error al cargar las reseñas.');
      this.isLoading.set(false);
    },
  });
}

  confirmDelete(review: Review, bookTitle: string): void {
    this.deletingReview.set({ review, bookTitle });
    this.deleteError.set(null);
  }

  cancelDelete(): void {
    this.deletingReview.set(null);
    this.deleteError.set(null);
    this.isDeleting.set(false);
  }

  executeDelete(): void {
    const target = this.deletingReview();
    if (!target) return;

    this.isDeleting.set(true);
    this.reviewsService.delete(target.review.id).subscribe({
      next: () => {
        // Quitar la reseña del signal local sin recargar todo
        this.booksWithReviews.update(books =>
          books.map(b => ({
            ...b,
            reviews: b.reviews.filter(r => r.id !== target.review.id),
          })).filter(b => b.reviews.length > 0)
        );
        this.deletingReview.set(null);
        this.isDeleting.set(false);
      },
      error: () => {
        this.deleteError.set('Error al eliminar la reseña.');
        this.isDeleting.set(false);
      },
    });
  }

  getRatingStars(rating: number): string[] {
    return Array.from({ length: 5 }, (_, i) =>
      i < rating ? 'bi-star-fill' : 'bi-star'
    );
  }

  get totalReviews(): number {
    return this.booksWithReviews().reduce((acc, b) => acc + b.reviews.length, 0);
  }
}