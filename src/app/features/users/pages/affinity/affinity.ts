import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Users, AffinityResult } from '../../services/users';
import { DecimalPipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-affinity',
  standalone: true,
  imports: [RouterLink, FormsModule, NgClass, DecimalPipe],
  templateUrl: './affinity.html',
})
export class Affinity implements OnInit {
  private usersService = inject(Users);

  affinityList = signal<AffinityResult[]>([]);
  isLoading    = signal(true);
  error        = signal<string | null>(null);
  limit        = signal(5);

  ngOnInit(): void {
    this.loadAffinity();
  }

  loadAffinity(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.usersService.getAffinity(this.limit()).subscribe({
      next: (list) => {
        this.affinityList.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de afinidades.');
        this.isLoading.set(false);
      },
    });
  }

  onLimitChange(): void {
    this.loadAffinity();
  }

  getScoreColor(score: number): string {
    if (score >= 0.8) return 'text-success';
    if (score >= 0.5) return 'text-warning';
    return 'text-danger';
  }

  getScoreBadge(score: number): string {
    if (score >= 0.8) return 'text-bg-success';
    if (score >= 0.5) return 'text-bg-warning';
    return 'text-bg-secondary';
  }

  getScorePercent(score: number): number {
    return Math.round(score * 100);
  }
}