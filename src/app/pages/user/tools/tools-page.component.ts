import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DefaultAppRoute } from '../../../core/users/interfaces/default-app-route.type';
import { PreferencesService } from '../../../core/users/services/preferences.service';

@Component({
  selector: 'app-tools-page',
  imports: [AsyncPipe, ReactiveFormsModule],
  templateUrl: './tools-page.component.html',
  styleUrl: './tools-page.component.css',
})
export class ToolsPageComponent {
  private readonly _preferencesService = inject(PreferencesService);

  protected feedbackMessage = '';
  protected readonly preferences$ = this._preferencesService.getCurrentUserPreferences();

  readonly preferencesForm = new FormGroup({
    showWelcomeBanner: new FormControl(true, { nonNullable: true }),
    compactTaskCards: new FormControl(false, { nonNullable: true }),
    inAppNotifications: new FormControl(true, { nonNullable: true }),
    defaultRoute: new FormControl<DefaultAppRoute>('/app/tarefas', {
      nonNullable: true,
    }),
  });

  constructor() {
    this.preferences$
      .pipe(takeUntilDestroyed())
      .subscribe((preferences) => {
        if (!preferences) {
          return;
        }

        this.preferencesForm.patchValue(preferences, { emitEvent: false });
      });
  }

  protected onSubmit() {
    this._preferencesService.updatePreferences({
      showWelcomeBanner: this.preferencesForm.value.showWelcomeBanner ?? true,
      compactTaskCards: this.preferencesForm.value.compactTaskCards ?? false,
      inAppNotifications: this.preferencesForm.value.inAppNotifications ?? true,
      defaultRoute:
        this.preferencesForm.value.defaultRoute ?? '/app/tarefas',
    });
    this.feedbackMessage = 'Ferramentas salvas com sucesso.';
  }
}
