import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  private fb = inject(FormBuilder);

  submitted = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get email() { return this.form.get('email')!; }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // El API no tiene endpoint de recuperación
    // Simulamos el envío mostrando mensaje informativo
    this.submitted.set(true);
  }
}