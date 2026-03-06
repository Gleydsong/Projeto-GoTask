import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SessionStoreService } from '../../../core/auth/services/session-store.service';
import { getUserInitials } from '../../../core/shared/utils/get-user-initials';
import { UserService } from '../../../core/users/services/user.service';

@Component({
  selector: 'app-profile-page',
  imports: [AsyncPipe, ReactiveFormsModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css',
})
export class ProfilePageComponent {
  private readonly _sessionStore = inject(SessionStoreService);
  private readonly _userService = inject(UserService);

  protected avatarPreview: string | null = null;
  protected feedbackMessage = '';
  protected avatarError = '';
  protected readonly currentUser$ = this._sessionStore.currentUser$;

  readonly profileForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    jobTitle: new FormControl(''),
    department: new FormControl(''),
    bio: new FormControl(''),
    phone: new FormControl(''),
    location: new FormControl(''),
  });

  constructor() {
    this.currentUser$
      .pipe(takeUntilDestroyed())
      .subscribe((currentUser) => {
        if (!currentUser) {
          return;
        }

        this.avatarPreview = currentUser.avatarUrl;
        this.profileForm.patchValue(
          {
            name: currentUser.name,
            jobTitle: currentUser.jobTitle,
            department: currentUser.department,
            bio: currentUser.bio,
            phone: currentUser.phone,
            location: currentUser.location,
          },
          { emitEvent: false },
        );
      });
  }

  protected getUserInitials(name: string) {
    return getUserInitials(name);
  }

  protected onAvatarSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.avatarError = 'Selecione um arquivo de imagem válido.';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.avatarError = 'A imagem precisa ter no máximo 2MB.';
      return;
    }

    this.avatarError = '';

    const reader = new FileReader();
    reader.onload = () => {
      const avatarAsDataUrl = typeof reader.result === 'string' ? reader.result : null;
      if (!avatarAsDataUrl) {
        this.avatarError = 'Não foi possível carregar essa imagem.';
        return;
      }

      this._userService.updateOwnAvatar(avatarAsDataUrl);
      this.avatarPreview = avatarAsDataUrl;
      this.feedbackMessage = 'Foto de perfil atualizada.';
    };
    reader.readAsDataURL(file);
  }

  protected removeAvatar() {
    this._userService.updateOwnAvatar(null);
    this.avatarPreview = null;
    this.feedbackMessage = 'Foto removida com sucesso.';
  }

  protected onSubmit() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this._userService.updateOwnProfile({
      name: this.profileForm.value.name?.trim() ?? '',
      jobTitle: this.profileForm.value.jobTitle?.trim() ?? '',
      department: this.profileForm.value.department?.trim() ?? '',
      bio: this.profileForm.value.bio?.trim() ?? '',
      phone: this.profileForm.value.phone?.trim() ?? '',
      location: this.profileForm.value.location?.trim() ?? '',
    });
    this.feedbackMessage = 'Perfil salvo com sucesso.';
  }
}
