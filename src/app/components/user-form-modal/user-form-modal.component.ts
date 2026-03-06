import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserRole } from '../../core/users/interfaces/user-role.type';
import { UserEntity } from '../../core/users/interfaces/user.entity';
import { CreateUserPayload, UpdateUserPayload } from '../../core/users/services/user.service';

interface UserFormModalData {
  mode: 'create' | 'edit';
  user?: UserEntity;
}

@Component({
  selector: 'app-user-form-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './user-form-modal.component.html',
  styleUrl: './user-form-modal.component.css',
})
export class UserFormModalComponent {
  protected readonly dialogData = inject<UserFormModalData>(DIALOG_DATA);
  protected readonly dialogRef = inject(DialogRef<CreateUserPayload | UpdateUserPayload>);

  readonly form = new FormGroup({
    name: new FormControl(this.dialogData.user?.name ?? '', [Validators.required]),
    email: new FormControl(this.dialogData.user?.email ?? '', [
      Validators.required,
      Validators.email,
    ]),
    password: new FormControl('', this.dialogData.mode === 'create' ? [Validators.required, Validators.minLength(6)] : []),
    role: new FormControl<UserRole>(this.dialogData.user?.role ?? 'employer', {
      nonNullable: true,
    }),
    active: new FormControl(this.dialogData.user?.active ?? true, { nonNullable: true }),
    jobTitle: new FormControl(this.dialogData.user?.jobTitle ?? ''),
    department: new FormControl(this.dialogData.user?.department ?? ''),
    phone: new FormControl(this.dialogData.user?.phone ?? ''),
    location: new FormControl(this.dialogData.user?.location ?? ''),
    bio: new FormControl(this.dialogData.user?.bio ?? ''),
  });

  protected onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      name: this.form.value.name?.trim() ?? '',
      email: this.form.value.email?.trim() ?? '',
      role: this.form.value.role ?? 'employer',
      active: this.form.value.active ?? true,
      jobTitle: this.form.value.jobTitle?.trim() ?? '',
      department: this.form.value.department?.trim() ?? '',
      phone: this.form.value.phone?.trim() ?? '',
      location: this.form.value.location?.trim() ?? '',
      bio: this.form.value.bio?.trim() ?? '',
      ...(this.dialogData.mode === 'create'
        ? { password: this.form.value.password ?? '' }
        : {}),
    };

    this.dialogRef.close(payload);
  }

  protected closeModal() {
    this.dialogRef.close();
  }
}
