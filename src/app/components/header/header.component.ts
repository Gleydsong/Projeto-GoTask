import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { AuthService } from '../../core/auth/services/auth.service';
import { SessionStoreService } from '../../core/auth/services/session-store.service';
import { getUserInitials } from '../../core/shared/utils/get-user-initials';
import { PreferencesService } from '../../core/users/services/preferences.service';

@Component({
  selector: 'app-header',
  imports: [AsyncPipe, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);
  private readonly _sessionStore = inject(SessionStoreService);
  private readonly _preferencesService = inject(PreferencesService);

  readonly viewModel$ = combineLatest([
    this._sessionStore.currentUser$,
    this._preferencesService.getCurrentUserPreferences(),
  ]).pipe(
    map(([currentUser, preferences]) => ({
      currentUser,
      preferences,
    })),
  );

  getUserInitials(name: string) {
    return getUserInitials(name);
  }

  async logout() {
    this._authService.logout();
    await this._router.navigateByUrl('/login');
  }
}
