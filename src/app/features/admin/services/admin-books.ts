import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from '../../../core/models/book';
import { Review } from '../../../core/models/review';
import { PaginatedResponse } from '../../../core/models/paginated-response';
import { Books, BookFilters } from '../../books/services/books';
import { Reviews } from '../../reviews/services/reviews';

// Re-exporta los servicios existentes para uso interno del admin
// No duplicamos lógica — el admin usa los mismos endpoints
@Injectable({ providedIn: 'root' })
export class AdminBooks {
  private booksService   = inject(Books);
  private reviewsService = inject(Reviews);

  // ── Libros ──
  getAll(filters: BookFilters = {}): Observable<PaginatedResponse<Book>> {
    return this.booksService.getAll(filters);
  }

  getById(id: string): Observable<Book> {
    return this.booksService.getById(id);
  }

  delete(id: string): Observable<void> {
    return this.booksService.delete(id);
  }

  // ── Reseñas (moderación) ──
  deleteReview(reviewId: string): Observable<void> {
    return this.reviewsService.delete(reviewId);
  }
}