import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './main-layout.html',
})
export class MainLayout implements OnInit {
  private auth   = inject(Auth);
  private router = inject(Router);

  // ── Signals del auth (readonly desde AuthService) ──
  readonly currentUser = this.auth.currentUser;
  readonly isAdmin     = this.auth.isAdmin;

  // ── Signals locales ──
  sidebarOpen = signal(false);
  isDark      = signal(false);
  searchQuery = signal('');

  ngOnInit(): void {
    // Restaurar tema guardado
    const saved = localStorage.getItem('bl_theme');
    if (saved === 'dark') this.applyTheme(true);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
    document.body.classList.toggle('sidebar-open', this.sidebarOpen());
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
    document.body.classList.remove('sidebar-open');
  }

  toggleTheme(): void {
    this.applyTheme(!this.isDark());
  }

  private applyTheme(dark: boolean): void {
    this.isDark.set(dark);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('bl_theme', dark ? 'dark' : 'light');
  }

  onSearch(): void {
    if (!this.searchQuery().trim()) return;
    this.router.navigate(['/books'], {
      queryParams: { title: this.searchQuery().trim() }
    });
    this.searchQuery.set('');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}