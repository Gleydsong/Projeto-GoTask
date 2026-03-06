import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { SessionStoreService } from '../../auth/services/session-store.service';
import { STORAGE_KEYS } from '../../shared/constants/storage-keys.const';
import { DefaultAppRoute } from '../interfaces/default-app-route.type';
import { UserPreferences } from '../interfaces/user-preferences.interface';

@Injectable({
  providedIn: 'root',
})
export class PreferencesService {
  private readonly _sessionStore = inject(SessionStoreService);
  private readonly _preferences = new BehaviorSubject<UserPreferences[]>(
    this.loadPreferences(),
  );

  readonly currentUserPreferences$ = combineLatest([
    this._preferences.asObservable(),
    this._sessionStore.currentUser$,
  ]).pipe(
    map(([preferences, user]) => {
      if (!user) {
        return null;
      }

      return (
        preferences.find((preference) => preference.userId === user.id) ??
        this.createDefaultPreferences(user.id)
      );
    }),
  );

  ensureUserPreferences(userId: string) {
    const preferences = this._preferences.value;
    const existing = preferences.find((preference) => preference.userId === userId);

    if (existing) {
      return structuredClone(existing);
    }

    const defaultPreferences = this.createDefaultPreferences(userId);
    this.commitPreferences([...preferences, defaultPreferences]);
    return defaultPreferences;
  }

  getCurrentUserPreferences() {
    return this.currentUserPreferences$;
  }

  getCurrentUserPreferencesSnapshot() {
    const currentUser = this._sessionStore.currentUserSnapshot;
    if (!currentUser) {
      return null;
    }

    return this.ensureUserPreferences(currentUser.id);
  }

  getDefaultRouteForCurrentUser(): DefaultAppRoute {
    return (
      this.getCurrentUserPreferencesSnapshot()?.defaultRoute ?? '/app/tarefas'
    );
  }

  updatePreferences(payload: Partial<UserPreferences>) {
    const currentUser = this._sessionStore.currentUserSnapshot;

    if (!currentUser) {
      return;
    }

    const preferences = this._preferences.value;
    const index = preferences.findIndex(
      (preference) => preference.userId === currentUser.id,
    );
    const basePreferences = this.ensureUserPreferences(currentUser.id);

    const updatedPreferences = {
      ...basePreferences,
      ...payload,
      userId: currentUser.id,
    };

    if (index < 0) {
      this.commitPreferences([...preferences, updatedPreferences]);
      return;
    }

    const nextPreferences = [...preferences];
    nextPreferences[index] = updatedPreferences;
    this.commitPreferences(nextPreferences);
  }

  private createDefaultPreferences(userId: string): UserPreferences {
    return {
      userId,
      showWelcomeBanner: true,
      compactTaskCards: false,
      inAppNotifications: true,
      defaultRoute: '/app/tarefas',
    };
  }

  private loadPreferences(): UserPreferences[] {
    try {
      const rawPreferences = localStorage.getItem(STORAGE_KEYS.preferences);
      return rawPreferences ? JSON.parse(rawPreferences) : [];
    } catch {
      return [];
    }
  }

  private commitPreferences(preferences: UserPreferences[]) {
    this._preferences.next(structuredClone(preferences));
    localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(preferences));
  }
}
