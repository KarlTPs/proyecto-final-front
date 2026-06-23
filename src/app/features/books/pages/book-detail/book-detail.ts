import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Books } from '../../services/books';
import { Reviews } from '../../../reviews/services/reviews';
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
  private route = inject(ActivatedRoute);
  private booksService = inject(Books);
  private auth = inject(Auth);

  book = signal<Book | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  readonly isAdmin = this.auth.isAdmin;
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly currentUser = this.auth.currentUser;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
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

  getRatingStars(rating: number | null | undefined): string[] {
    if (!rating) return Array(5).fill('bi-star');
    return Array.from({ length: 5 }, (_, i) =>
      i < Math.round(rating) ? 'bi-star-fill' : 'bi-star'
    );
  }

  onReviewSubmitted(): void {
    // Recargar el libro para actualizar averageRating y reviewsCount
    const id = this.route.snapshot.paramMap.get('id')!;
    this.booksService.getById(id).subscribe(book => this.book.set(book));
  }

  // Asegura que reviews siempre sea un array tipado
  readonly bookReviews = computed(() =>
    ((this.book()?.reviews ?? []) as Review[])
  );

  readonly userHasReviewed = computed(() => {
    const userId = this.currentUser()?.id;
    if (!userId) return false;
    return this.bookReviews().some(r => r.user.id === userId);
  });
}