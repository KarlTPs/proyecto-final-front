import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../../core/services/auth';

// Validador personalizado: contraseña con mayúscula + minúscula + (número o símbolo)
function passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  const hasUpper  = /[A-Z]/.test(value);
  const hasLower  = /[a-z]/.test(value);
  const hasNumSym = /[\d\W]/.test(value);
  return hasUpper && hasLower && hasNumSym ? null : { passwordStrength: true };
}

// Validador: las contraseñas coinciden
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm  = control.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {
  private fb      = inject(FormBuilder);
  private auth    = inject(Auth);
  private router  = inject(Router);

  isLoading    = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.group({
    username: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(20),
    ]],
    email: ['', [
      Validators.required,
      Validators.email,
    ]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      passwordStrengthValidator,
    ]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatchValidator });

  get username()        { return this.form.get('username')!; }
  get email()           { return this.form.get('email')!; }
  get password()        { return this.form.get('password')!; }
  get confirmPassword() { return this.form.get('confirmPassword')!; }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { username, email, password } = this.form.value;

    this.auth.register({
      username: username!,
      email:    email!,
      password: password!,
    }).subscribe({
      next: () => this.router.navigate(['/books']),
      error: (err) => {
        this.errorMessage.set(
          err.status === 409
            ? 'El nombre de usuario o correo ya están en uso.'
            : 'Error al crear la cuenta. Intenta de nuevo.'
        );
        this.isLoading.set(false);
      },
    });
  }
}