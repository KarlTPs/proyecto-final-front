import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book } from '../../../core/models/book';
import { PaginatedResponse } from '../../../core/models/paginated-response';
import { environment } from '../../../../environments/environment';

const BASE = `${environment.apiUrl}/books`;

export interface BookFilters {
  page?: number;
  limit?: number;
  title?: string;
  author?: string;
  genre?: string;
}

@Injectable({ providedIn: 'root' })
export class Books {
  private http = inject(HttpClient);

  getAll(filters: BookFilters = {}): Observable<PaginatedResponse<Book>> {
    let params = new HttpParams();
    if (filters.page)   params = params.set('page',   filters.page);
    if (filters.limit)  params = params.set('limit',  filters.limit);
    if (filters.title)  params = params.set('title',  filters.title);
    if (filters.author) params = params.set('author', filters.author);
    if (filters.genre)  params = params.set('genre',  filters.genre);
    return this.http.get<PaginatedResponse<Book>>(BASE, { params });
  }

  getById(id: string): Observable<Book> {
    return this.http.get<Book>(`${BASE}/${id}`);
  }

  create(data: Partial<Book>): Observable<Book> {
    return this.http.post<Book>(BASE, data);
  }

  update(id: string, data: Partial<Book>): Observable<Book> {
    return this.http.patch<Book>(`${BASE}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${BASE}/${id}`);
  }

  uploadImage(id: string, file: File): Observable<Book> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<Book>(`${BASE}/${id}/image`, form);
  }
}