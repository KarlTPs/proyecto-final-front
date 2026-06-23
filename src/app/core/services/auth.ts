import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { AuthResponse } from '../models/auth-response';
import { Storage } from './storage';
import { environment } from '../../../environments/environment';

const BASE = `${environment.apiUrl}/auth`;

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private storage = inject(Storage);

  // ── Signals ─────────────────────────────────────────────
  private _currentUser = signal<User | null>(this.storage.getUser());
  private _token       = signal<string | null>(this.storage.getToken());

  // Signals públicos (solo lectura)
  readonly currentUser    = this._currentUser.asReadonly();
  readonly token          = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly isAdmin         = computed(() => this._currentUser()?.role === 'admin');

  // ── Auth endpoints ───────────────────────────────────────
  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${BASE}/login`, credentials).pipe(
      tap(res => this.persist(res))
    );
  }

  register(data: { username: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${BASE}/register`, data).pipe(
      tap(res => this.persist(res))
    );
  }

  logout(): void {
    this._currentUser.set(null);
    this._token.set(null);
    this.storage.clear();
  }

  // ── Helpers privados ─────────────────────────────────────
  private persist(res: AuthResponse): void {
    this._token.set(res.accessToken);
    this._currentUser.set(res.user);
    this.storage.saveToken(res.accessToken);
    this.storage.saveUser(res.user);
  }
}