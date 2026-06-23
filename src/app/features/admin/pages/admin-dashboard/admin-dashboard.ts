import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Books } from '../../../books/services/books';
import { Book } from '../../../../core/models/book';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-dashboard.html',
})
export class AdminDashboard implements OnInit {
  private booksService = inject(Books);

  recentBooks = signal<Book[]>([]);
  totalBooks  = signal(0);
  isLoading   = signal(true);
  error       = signal<string | null>(null);

  readonly booksWithRating = computed(() =>
    this.recentBooks().filter(b => b.averageRating !== null)
  );

  readonly booksWithoutCover = computed(() =>
    this.recentBooks().filter(b => !b.coverImage).length
  );

  ngOnInit(): void {
    this.booksService.getAll({ page: 1, limit: 5 }).subscribe({
      next: (res) => {
        this.recentBooks.set(res.data);
        this.totalBooks.set(res.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar datos del dashboard.');
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
}