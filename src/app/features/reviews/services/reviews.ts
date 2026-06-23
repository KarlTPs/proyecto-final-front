import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../../../core/models/review';
import { environment } from '../../../../environments/environment';

const BASE = `${environment.apiUrl}`;

export interface CreateReviewDto {
  rating: number;
  comment?: string;
}

@Injectable({ providedIn: 'root' })
export class Reviews {
  private http = inject(HttpClient);

  getByBook(bookId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${BASE}/books/${bookId}/reviews`);
  }

  create(bookId: string, data: CreateReviewDto): Observable<Review> {
    return this.http.post<Review>(`${BASE}/books/${bookId}/reviews`, data);
  }

  update(reviewId: string, data: Partial<CreateReviewDto>): Observable<Review> {
    return this.http.patch<Review>(`${BASE}/reviews/${reviewId}`, data);
  }

  delete(reviewId: string): Observable<void> {
    return this.http.delete<void>(`${BASE}/reviews/${reviewId}`);
  }
}