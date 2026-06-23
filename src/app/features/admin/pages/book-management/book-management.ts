import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Books, BookFilters } from '../../../books/services/books';
import { Book } from '../../../../core/models/book';
import { PaginatedResponse } from '../../../../core/models/paginated-response';

@Component({
  selector: 'app-book-management',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './book-management.html',
})
export class BookManagement implements OnInit {
  private booksService = inject(Books);

  books      = signal<Book[]>([]);
  total      = signal(0);
  totalPages = signal(0);
  isLoading  = signal(false);
  error      = signal<string | null>(null);

  // Filtros
  page        = signal(1);
  limit       = signal(10);
  searchTitle = signal('');

  // Modal de confirmación de borrado
  deletingBook   = signal<Book | null>(null);
  isDeleting     = signal(false);
  deleteError    = signal<string | null>(null);

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const filters: BookFilters = {
      page:  this.page(),
      limit: this.limit(),
      title: this.searchTitle() || undefined,
    };

    this.booksService.getAll(filters).subscribe({
      next: (res: PaginatedResponse<Book>) => {
        this.books.set(res.data);
        this.total.set(res.total);
        this.totalPages.set(res.totalPages);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar los libros.');
        this.isLoading.set(false);
      },
    });
  }

  onSearch(): void {
    this.page.set(1);
    this.loadBooks();
  }

  onReset(): void {
    this.searchTitle.set('');
    this.page.set(1);
    this.loadBooks();
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages()) return;
    this.page.set(p);
    this.loadBooks();
  }

  // ── Borrado ──
  confirmDelete(book: Book): void {
    this.deletingBook.set(book);
    this.deleteError.set(null);
  }

  cancelDelete(): void {
    this.deletingBook.set(null);
    this.deleteError.set(null);
    this.isDeleting.set(false);
  }

  executeDelete(): void {
    const book = this.deletingBook();
    if (!book) return;

    this.isDeleting.set(true);
    this.deleteError.set(null);

    this.booksService.delete(book.id).subscribe({
      next: () => {
        this.deletingBook.set(null);
        this.isDeleting.set(false);
        // Si era el último de la página, retroceder
        if (this.books().length === 1 && this.page() > 1) {
          this.page.update(p => p - 1);
        }
        this.loadBooks();
      },
      error: () => {
        this.deleteError.set('Error al eliminar el libro.');
        this.isDeleting.set(false);
      },
    });
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }
}