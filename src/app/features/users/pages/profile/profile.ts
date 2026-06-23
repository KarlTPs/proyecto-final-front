import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Users } from '../../services/users';
import { Auth } from '../../../../core/services/auth';
import { User } from '../../../../core/models/user';
import { Review } from '../../../../core/models/review';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  private usersService = inject(Users);
  private auth         = inject(Auth);

  profile    = signal<User | null>(null);
  reviews    = signal<Review[]>([]);
  isLoading  = signal(true);
  error      = signal<string | null>(null);

  readonly isAdmin = this.auth.isAdmin;

  ngOnInit(): void {
    this.usersService.getProfile().subscribe({
      next: (user) => {
        this.profile.set(user);
        this.loadReviews(user.id);
      },
      error: () => {
        this.error.set('No se pudo cargar el perfil.');
        this.isLoading.set(false);
      },
    });
  }

  private loadReviews(userId: string): void {
    this.usersService.getReviewsByUser(userId).subscribe({
      next: (reviews) => {
        this.reviews.set(reviews);
        this.isLoading.set(false);
      },
      error: () => {
        // Las reseñas son opcionales, no bloquear la página
        this.isLoading.set(false);
      },
    });
  }

  getRatingStars(rating: number): string[] {
    return Array.from({ length: 5 }, (_, i) =>
      i < rating ? 'bi-star-fill' : 'bi-star'
    );
  }

  logout(): void {
    this.auth.logout();
  }
}