import { Injectable, inject } from '@angular/core';
import { STORAGE_KEYS } from '../../shared/constants/storage-keys.const';
import { UserRole } from '../../users/interfaces/user-role.type';
import { PreferencesService } from '../../users/services/preferences.service';
import { UserService } from '../../users/services/user.service';
import { TaskService } from '../../../services/task.service';
import { SessionState } from '../interfaces/session-state.interface';
import { SessionStoreService } from './session-store.service';

export interface AuthResult {
  success: boolean;
  error?: 'invalid_credentials' | 'inactive_user';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _userService = inject(UserService);
  private readonly _sessionStore = inject(SessionStoreService);
  private readonly _preferencesService = inject(PreferencesService);
  private readonly _taskService = inject(TaskService);

  login(email: string, password: string): AuthResult {
    const user = this._userService.getUserByEmail(email);

    if (!user || user.password !== password) {
      return { success: false, error: 'invalid_credentials' };
    }

    if (!user.active) {
      return { success: false, error: 'inactive_user' };
    }

    const sessionState: SessionState = {
      userId: user.id,
      loginAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(sessionState));
    this._sessionStore.setCurrentUser(this._userService.toSessionUser(user));
    this._preferencesService.ensureUserPreferences(user.id);
    this._taskService.migrateLegacyTasksToUser(user.id);

    return { success: true };
  }

  restoreSession() {
    const currentUser = this._sessionStore.currentUserSnapshot;
    if (currentUser) {
      return true;
    }

    try {
      const rawSession = localStorage.getItem(STORAGE_KEYS.session);
      if (!rawSession) {
        return false;
      }

      const sessionState: SessionState = JSON.parse(rawSession);
      const user = this._userService.getUserById(sessionState.userId);

      if (!user || !user.active) {
        this.logout();
        return false;
      }

      this._sessionStore.setCurrentUser(this._userService.toSessionUser(user));
      this._preferencesService.ensureUserPreferences(user.id);
      this._taskService.migrateLegacyTasksToUser(user.id);
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  logout() {
    localStorage.removeItem(STORAGE_KEYS.session);
    this._sessionStore.clear();
  }

  isAuthenticated() {
    return this.restoreSession();
  }

  hasRole(role: UserRole) {
    const currentUser = this._sessionStore.currentUserSnapshot;
    return currentUser?.role === role;
  }

  getDefaultAuthenticatedRoute() {
    return this._preferencesService.getDefaultRouteForCurrentUser();
  }
}
