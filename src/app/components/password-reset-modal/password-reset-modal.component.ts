import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface PasswordResetModalData {
  userName: string;
}

@Component({
  selector: 'app-password-reset-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './password-reset-modal.component.html',
  styleUrl: './password-reset-modal.component.css',
})
export class PasswordResetModalComponent {
  protected readonly dialogData = inject<PasswordResetModalData>(DIALOG_DATA);
  protected readonly dialogRef = inject(DialogRef<string>);

  readonly form = new FormGroup({
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    confirmPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  protected errorMessage = '';

  protected onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.value.password !== this.form.value.confirmPassword) {
      this.errorMessage = 'As senhas precisam ser iguais.';
      return;
    }

    this.dialogRef.close(this.form.value.password ?? '');
  }

  protected closeModal() {
    this.dialogRef.close();
  }
}
