import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../../core/models/user';
import { Review } from '../../../core/models/review';
import { environment } from '../../../../environments/environment';

const BASE = `${environment.apiUrl}`;

export interface AffinityResult {
  userId: string;
  username: string;
  affinityScore: number;
  sharedBooksCount: number;
}

@Injectable({ providedIn: 'root' })
export class Users {
  private http = inject(HttpClient);

  getProfile(): Observable<User> {
    return this.http.get<User>(`${BASE}/users/profile`);
  }

  getAffinity(limit = 5): Observable<AffinityResult[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<AffinityResult[]>(`${BASE}/users/affinity`, { params });
  }

  getReviewsByUser(userId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${BASE}/users/${userId}/reviews`);
  }
}