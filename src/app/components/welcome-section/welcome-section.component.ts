import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { SessionStoreService } from '../../core/auth/services/session-store.service';
import { PreferencesService } from '../../core/users/services/preferences.service';
import { TaskService } from '../../services/task.service';
import { ModalControllerService } from './../../services/modal-controller.service';
@Component({
  selector: 'app-welcome-section',
  imports: [AsyncPipe],
  templateUrl: './welcome-section.component.html',
  styleUrl: './welcome-section.component.css',
})
export class WelcomeSectionComponent {
  private readonly _modalControllerService = inject(ModalControllerService);
  private readonly _taskService = inject(TaskService);
  private readonly _sessionStore = inject(SessionStoreService);
  private readonly _preferencesService = inject(PreferencesService);

  readonly viewModel$ = combineLatest([
    this._sessionStore.currentUser$,
    this._preferencesService.getCurrentUserPreferences(),
  ]).pipe(
    map(([currentUser, preferences]) => ({
      currentUser,
      showWelcomeBanner: preferences?.showWelcomeBanner ?? true,
    })),
  );

  openNewTaskModal() {
    const dialogRef = this._modalControllerService.openNewTaskModal();

    dialogRef.closed.subscribe((taskForm) => {
      if (taskForm) {
        this._taskService.addTask(taskForm);
      }
    });
  }

  getFirstName(name: string) {
    return name.trim().split(' ')[0] || 'Usuário';
  }
}
