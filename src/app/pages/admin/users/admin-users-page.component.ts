import { AsyncPipe, DatePipe } from '@angular/common';
import { Dialog } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { PasswordResetModalComponent } from '../../../components/password-reset-modal/password-reset-modal.component';
import { UserFormModalComponent } from '../../../components/user-form-modal/user-form-modal.component';
import { UserEntity } from '../../../core/users/interfaces/user.entity';
import { UserService } from '../../../core/users/services/user.service';

@Component({
  selector: 'app-admin-users-page',
  imports: [AsyncPipe, DatePipe],
  templateUrl: './admin-users-page.component.html',
  styleUrl: './admin-users-page.component.css',
})
export class AdminUsersPageComponent {
  private readonly _userService = inject(UserService);
  private readonly _dialog = inject(Dialog);

  protected readonly users$ = this._userService.listUsers();
  protected feedbackMessage = '';
  protected errorMessage = '';

  protected openCreateUserModal() {
    const dialogRef = this._dialog.open(UserFormModalComponent, {
      width: '95%',
      maxWidth: '720px',
      data: { mode: 'create' },
    });

    dialogRef.closed.subscribe((payload) => {
      if (!payload) {
        return;
      }

      try {
        this._userService.createUser(payload);
        this.feedbackMessage = 'Usuário criado com sucesso.';
        this.errorMessage = '';
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Erro ao criar usuário.';
      }
    });
  }

  protected openEditUserModal(user: UserEntity) {
    const dialogRef = this._dialog.open(UserFormModalComponent, {
      width: '95%',
      maxWidth: '720px',
      data: { mode: 'edit', user },
    });

    dialogRef.closed.subscribe((payload) => {
      if (!payload) {
        return;
      }

      try {
        this._userService.updateUser(user.id, payload);
        this.feedbackMessage = 'Usuário atualizado com sucesso.';
        this.errorMessage = '';
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar usuário.';
      }
    });
  }

  protected toggleUser(user: UserEntity) {
    try {
      this._userService.toggleUserActive(user.id, !user.active);
      this.feedbackMessage = user.active
        ? 'Usuário desativado com sucesso.'
        : 'Usuário reativado com sucesso.';
      this.errorMessage = '';
    } catch (error) {
      this.errorMessage =
        error instanceof Error ? error.message : 'Erro ao atualizar status do usuário.';
    }
  }

  protected openPasswordResetModal(user: UserEntity) {
    const dialogRef = this._dialog.open(PasswordResetModalComponent, {
      width: '95%',
      maxWidth: '520px',
      data: { userName: user.name },
    });

    dialogRef.closed.subscribe((password) => {
      if (!password) {
        return;
      }

      this._userService.resetUserPassword(user.id, password);
      this.feedbackMessage = 'Senha redefinida com sucesso.';
      this.errorMessage = '';
    });
  }
}
