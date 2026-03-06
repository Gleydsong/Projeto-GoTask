import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { SessionStoreService } from '../../auth/services/session-store.service';
import { UserService } from './user.service';

describe('UserService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('deve iniciar com os usuários seed', async () => {
    const userService = TestBed.inject(UserService);

    const users = await firstValueFrom(userService.listUsers());

    expect(users.length).toBe(2);
    expect(users.some((user) => user.role === 'admin')).toBeTrue();
    expect(users.some((user) => user.role === 'employer')).toBeTrue();
  });

  it('não deve permitir emails duplicados', () => {
    const userService = TestBed.inject(UserService);

    expect(() =>
      userService.createUser({
        name: 'Duplicado',
        email: 'admin@gotask.local',
        password: '123456',
        role: 'employer',
      }),
    ).toThrowError('Já existe um usuário com este email.');
  });

  it('não deve permitir remover o último admin ativo', () => {
    const userService = TestBed.inject(UserService);

    expect(() => userService.toggleUserActive('seed-admin', false)).toThrowError(
      'O sistema precisa manter ao menos um admin ativo.',
    );
  });

  it('deve permitir o próprio usuário atualizar o perfil', () => {
    const userService = TestBed.inject(UserService);
    const sessionStore = TestBed.inject(SessionStoreService);

    sessionStore.setCurrentUser(userService.toSessionUser(userService.getUserById('seed-employer')!));
    userService.updateOwnProfile({
      name: 'Employer Atualizado',
      jobTitle: 'Coordenador',
      department: 'Produto',
      bio: 'Bio atualizada',
      phone: '9999-9999',
      location: 'Lisboa',
    });

    expect(userService.getUserById('seed-employer')?.name).toBe('Employer Atualizado');
    expect(sessionStore.currentUserSnapshot?.name).toBe('Employer Atualizado');
  });
});
