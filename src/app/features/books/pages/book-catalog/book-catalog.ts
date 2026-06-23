import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Books, BookFilters } from '../../services/books';
import { Book } from '../../../../core/models/book';
import { PaginatedResponse } from '../../../../core/models/paginated-response';
import { Auth } from '../../../../core/services/auth';

@Component({
  selector: 'app-book-catalog',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './book-catalog.html',
})
export class BookCatalog implements OnInit {
  private booksService = inject(Books);
  private auth         = inject(Auth);
  private route        = inject(ActivatedRoute);
  private router       = inject(Router);

  // ── Signals ──
  books      = signal<Book[]>([]);
  total      = signal(0);
  totalPages = signal(0);
  isLoading  = signal(false);
  error      = signal<string | null>(null);

  // Filtros
  page   = signal(1);
  limit  = signal(12);
  title  = signal('');
  author = signal('');
  genre  = signal('');

  readonly isAdmin = this.auth.isAdmin;

  // Páginas para el paginador
  readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  ngOnInit(): void {
    // Leer queryParams del navbar search
    this.route.queryParams.subscribe(params => {
      if (params['title']) this.title.set(params['title']);
      this.loadBooks();
    });
  }

  loadBooks(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const filters: BookFilters = {
      page:   this.page(),
      limit:  this.limit(),
      title:  this.title()  || undefined,
      author: this.author() || undefined,
      genre:  this.genre()  || undefined,
    };

    this.booksService.getAll(filters).subscribe({
      next: (res: PaginatedResponse<Book>) => {
        this.books.set(res.data);
        this.total.set(res.total);
        this.totalPages.set(res.totalPages);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar el catálogo.');
        this.isLoading.set(false);
      },
    });
  }

  onSearch(): void {
    this.page.set(1);
    this.loadBooks();
  }

  onReset(): void {
    this.title.set('');
    this.author.set('');
    this.genre.set('');
    this.page.set(1);
    this.router.navigate([], { queryParams: {} });
    this.loadBooks();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.loadBooks();
  }

  getRatingStars(rating: number | null | undefined): string[] {
    if (!rating) return Array(5).fill('bi-star');
    return Array.from({ length: 5 }, (_, i) =>
      i < Math.round(rating) ? 'bi-star-fill' : 'bi-star'
    );
  }
}