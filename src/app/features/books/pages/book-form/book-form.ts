import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Books } from '../../services/books';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './book-form.html',
})
export class BookForm implements OnInit, HasUnsavedChanges {
  private fb      = inject(FormBuilder);
  private books   = inject(Books);
  private router  = inject(Router);
  private route   = inject(ActivatedRoute);

  // ── Signals ──
  isLoading      = signal(false);
  isLoadingBook  = signal(false);
  errorMessage   = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  imagePreview   = signal<string | null>(null);
  selectedFile   = signal<File | null>(null);
  bookId         = signal<string | null>(null);

  readonly isEditing = () => !!this.bookId();

  // ── Formulario ──
  form = this.fb.group({
    title:           ['', [Validators.required, Validators.maxLength(200)]],
    author:          ['', [Validators.required, Validators.maxLength(150)]],
    synopsis:        [''],
    genre:           ['', Validators.maxLength(100)],
    publicationDate: [''],
  });

  get title()           { return this.form.get('title')!; }
  get author()          { return this.form.get('author')!; }
  get synopsis()        { return this.form.get('synopsis')!; }
  get genre()           { return this.form.get('genre')!; }
  get publicationDate() { return this.form.get('publicationDate')!; }

  // ── HasUnsavedChanges ──
  hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.bookId.set(id);
      this.loadBook(id);
    }
  }

  private loadBook(id: string): void {
    this.isLoadingBook.set(true);
    this.books.getById(id).subscribe({
      next: (book) => {
        this.form.patchValue({
          title:           book.title,
          author:          book.author,
          synopsis:        book.synopsis ?? '',
          genre:           book.genre ?? '',
          publicationDate: book.publicationDate ?? '',
        });
        if (book.coverImage) this.imagePreview.set(book.coverImage);
        this.isLoadingBook.set(false);
        // Resetear dirty tras cargar datos
        this.form.markAsPristine();
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el libro.');
        this.isLoadingBook.set(false);
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;

    // Validar tipo y tamaño (5MB)
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.errorMessage.set('Solo se permiten imágenes JPEG, PNG o WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage.set('La imagen no puede superar los 5MB.');
      return;
    }

    this.selectedFile.set(file);
    this.errorMessage.set(null);

    // Preview local
    const reader = new FileReader();
    reader.onload = () => this.imagePreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedFile.set(null);
    this.imagePreview.set(null);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload = {
      title:           this.form.value.title!,
      author:          this.form.value.author!,
      synopsis:        this.form.value.synopsis  || undefined,
      genre:           this.form.value.genre     || undefined,
      publicationDate: this.form.value.publicationDate || undefined,
    };

    const request$ = this.isEditing()
      ? this.books.update(this.bookId()!, payload)
      : this.books.create(payload);

    request$.subscribe({
      next: (book) => {
        this.form.markAsPristine();

        // Si hay imagen seleccionada, subirla después de crear/editar
        if (this.selectedFile()) {
          this.uploadImage(book.id);
        } else {
          this.onSuccess(book.id);
        }
      },
      error: (err) => {
        this.errorMessage.set(
          err.status === 403
            ? 'No tienes permisos para realizar esta acción.'
            : 'Error al guardar el libro.'
        );
        this.isLoading.set(false);
      },
    });
  }

  private uploadImage(bookId: string): void {
    this.books.uploadImage(bookId, this.selectedFile()!).subscribe({
      next: () => this.onSuccess(bookId),
      error: () => {
        // El libro se guardó pero la imagen falló
        this.successMessage.set('Libro guardado, pero hubo un error al subir la imagen.');
        this.isLoading.set(false);
        setTimeout(() => this.router.navigate(['/books', bookId]), 2000);
      },
    });
  }

  private onSuccess(bookId: string): void {
    this.isLoading.set(false);
    this.router.navigate(['/books', bookId]);
  }
}