import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Books } from '../../../books/services/books';
import { Reviews } from '../../../reviews/services/reviews';
import { Book } from '../../../../core/models/book';
import { Review } from '../../../../core/models/review';

interface BookWithReviews {
  id: string;
  title: string;
  author: string;
  coverImage: string | null;
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

  deletingReview = signal<{ review: Review; bookTitle: string } | null>(null);
  isDeleting     = signal(false);
  deleteError    = signal<string | null>(null);

  ngOnInit(): void {
    this.loadBooksWithReviews();
  }

  private loadBooksWithReviews(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.booksService.getAll({ page: 1, limit: 50 }).subscribe({
      next: (res) => {
        if (res.data.length === 0) {
          this.booksWithReviews.set([]);
          this.isLoading.set(false);
          return;
        }

        const requests = res.data.map(book =>
          this.booksService.getById(book.id).pipe(
            catchError(() => of(null))
          )
        );

        forkJoin(requests).subscribe(details => {
          const withReviews: BookWithReviews[] = details
            .filter((b): b is Book => {
              if (!b) return false;
              if (!Array.isArray(b.reviews)) return false;
              if (b.reviews.length === 0) return false;
              return true;
            })
            .map(b => ({
              id:         b.id,
              title:      b.title,
              author:     b.author,
              coverImage: b.coverImage,
              // Filtrar solo reseñas que tienen user válido
              reviews: (b.reviews as Review[]).filter(
                r => r && r.id && r.user && r.user.id && r.user.username
              ),
            }))
            // Descartar libros que quedaron sin reseñas válidas
            .filter(b => b.reviews.length > 0);

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

    const reviewId = target.review?.id;
    if (!reviewId) {
      this.deleteError.set('No se pudo identificar la reseña.');
      return;
    }

    this.isDeleting.set(true);
    this.deleteError.set(null);

    this.reviewsService.delete(reviewId).subscribe({
      next: () => {
        this.booksWithReviews.update(books =>
          books
            .map(b => ({
              ...b,
              reviews: b.reviews.filter(r => r.id !== reviewId),
            }))
            .filter(b => b.reviews.length > 0)
        );
        this.deletingReview.set(null);
        this.isDeleting.set(false);
      },
      error: (err) => {
        this.deleteError.set(
          err.status === 403
            ? 'No tienes permisos para eliminar esta reseña.'
            : err.status === 404
            ? 'La reseña ya no existe.'
            : `Error al eliminar la reseña (${err.status}).`
        );
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
    return this.booksWithReviews().reduce(
      (acc, b) => acc + b.reviews.length, 0
    );
  }
}