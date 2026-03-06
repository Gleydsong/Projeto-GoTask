import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);

  protected errorMessage = '';

  readonly loginForm = new FormGroup({
    email: new FormControl('admin@gotask.local', [
      Validators.required,
      Validators.email,
    ]),
    password: new FormControl('123456', [Validators.required]),
  });

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const result = this._authService.login(
      this.loginForm.value.email ?? '',
      this.loginForm.value.password ?? '',
    );

    if (!result.success) {
      this.errorMessage =
        result.error === 'inactive_user'
          ? 'Esse usuário está inativo e não pode acessar o sistema.'
          : 'Email ou senha inválidos.';
      return;
    }

    this.errorMessage = '';
    await this._router.navigateByUrl(this._authService.getDefaultAuthenticatedRoute());
  }

  fillCredentials(email: string) {
    this.loginForm.patchValue({
      email,
      password: '123456',
    });
  }
}
