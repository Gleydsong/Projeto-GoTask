import { TestBed } from '@angular/core/testing';
import { STORAGE_KEYS } from '../../shared/constants/storage-keys.const';
import { UserService } from '../../users/services/user.service';
import { AuthService } from './auth.service';
import { SessionStoreService } from './session-store.service';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('deve autenticar um usuário válido e persistir a sessão', () => {
    const authService = TestBed.inject(AuthService);
    const sessionStore = TestBed.inject(SessionStoreService);

    const result = authService.login('admin@gotask.local', '123456');

    expect(result.success).toBeTrue();
    expect(sessionStore.currentUserSnapshot?.email).toBe('admin@gotask.local');
    expect(localStorage.getItem(STORAGE_KEYS.session)).not.toBeNull();
  });

  it('deve rejeitar credenciais inválidas', () => {
    const authService = TestBed.inject(AuthService);

    const result = authService.login('admin@gotask.local', 'senha-invalida');

    expect(result.success).toBeFalse();
    expect(result.error).toBe('invalid_credentials');
  });

  it('deve bloquear usuário inativo', () => {
    const authService = TestBed.inject(AuthService);
    const userService = TestBed.inject(UserService);

    userService.toggleUserActive('seed-employer', false);
    const result = authService.login('employer@gotask.local', '123456');

    expect(result.success).toBeFalse();
    expect(result.error).toBe('inactive_user');
  });
});
