import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Users } from '../../services/users';
import { Review } from '../../../../core/models/review';

@Component({
  selector: 'app-user-reviews',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './user-reviews.html',
})
export class UserReviews implements OnInit {
  private route        = inject(ActivatedRoute);
  private usersService = inject(Users);

  reviews   = signal<Review[]>([]);
  userId    = signal<string>('');
  username  = signal<string>('');
  isLoading = signal(true);
  error     = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.userId.set(id);
    this.loadReviews(id);
  }

  private loadReviews(userId: string): void {
    this.usersService.getReviewsByUser(userId).subscribe({
      next: (reviews) => {
        this.reviews.set(reviews);
        // Extraer username de la primera reseña si existe
        if (reviews.length > 0) {
          this.username.set(reviews[0].user.username);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(
          err.status === 404
            ? 'Usuario no encontrado.'
            : 'Error al cargar las reseñas.'
        );
        this.isLoading.set(false);
      },
    });
  }

  getRatingStars(rating: number): string[] {
    return Array.from({ length: 5 }, (_, i) =>
      i < rating ? 'bi-star-fill' : 'bi-star'
    );
  }
}