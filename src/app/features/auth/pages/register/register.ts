import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../../core/services/auth';

/**
 * Valida que el password tenga mayúscula, minúscula y (número o símbolo),
 * replicando la regla del backend (ver POST /auth/register en la doc de la API).
 */
function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null;

  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumberOrSymbol = /[0-9]|[^A-Za-z0-9]/.test(value);

  return hasUpper && hasLower && hasNumberOrSymbol ? null : { weakPassword: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator]],
  });

  get username() { return this.form.get('username')!; }
  get email() { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { username, email, password } = this.form.value;

    this.authService.register({ username: username!, email: email!, password: password! }).subscribe({
      next: () => this.router.navigate(['/books']),
      error: (err) => {
        if (err.status === 409) {
          this.errorMessage.set('Ese nombre de usuario o correo ya está registrado.');
        } else if (err.status === 400) {
          const msg = err.error?.message;
          this.errorMessage.set(Array.isArray(msg) ? msg.join(' ') : (msg ?? 'Datos inválidos.'));
        } else {
          this.errorMessage.set('Error al crear la cuenta. Intenta de nuevo.');
        }
        this.isLoading.set(false);
      },
    });
  }
}