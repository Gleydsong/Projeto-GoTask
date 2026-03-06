import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { generateUniqueIdWithTimestamp } from '../../../utils/generate-unique-id-with-timestamp';
import { SessionUser } from '../../auth/interfaces/session-user.interface';
import { SessionStoreService } from '../../auth/services/session-store.service';
import { STORAGE_KEYS } from '../../shared/constants/storage-keys.const';
import { UserEntity } from '../interfaces/user.entity';
import { UserRole } from '../interfaces/user-role.type';
import { PreferencesService } from './preferences.service';

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active?: boolean;
  jobTitle?: string;
  department?: string;
  bio?: string;
  phone?: string;
  location?: string;
}

export interface UpdateProfilePayload {
  name: string;
  jobTitle: string;
  department: string;
  bio: string;
  phone: string;
  location: string;
}

export interface UpdateUserPayload extends Partial<CreateUserPayload> {
  avatarUrl?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _sessionStore = inject(SessionStoreService);
  private readonly _preferencesService = inject(PreferencesService);
  private readonly _users = new BehaviorSubject<UserEntity[]>(this.loadUsers());

  readonly users$ = this._users.asObservable().pipe(
    map((users) =>
      structuredClone(users).sort((userA, userB) =>
        userA.createdAt < userB.createdAt ? 1 : -1,
      ),
    ),
  );

  constructor() {
    if (this._users.value.length === 0) {
      this.seedUsers();
    } else {
      this._users.value.forEach((user) =>
        this._preferencesService.ensureUserPreferences(user.id),
      );
    }
  }

  listUsers() {
    return this.users$;
  }

  getCurrentUser() {
    const currentUser = this._sessionStore.currentUserSnapshot;
    if (!currentUser) {
      return null;
    }

    return this.getUserById(currentUser.id);
  }

  getUserById(userId: string) {
    const user = this._users.value.find((currentUser) => currentUser.id === userId);
    return user ? structuredClone(user) : null;
  }

  getUserByEmail(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = this._users.value.find(
      (currentUser) => currentUser.email.toLowerCase() === normalizedEmail,
    );
    return user ? structuredClone(user) : null;
  }

  updateOwnProfile(payload: UpdateProfilePayload) {
    const currentUser = this.getCurrentUser();

    if (!currentUser) {
      return null;
    }

    return this.updateUserInternal(currentUser.id, payload);
  }

  updateOwnAvatar(dataUrl: string | null) {
    const currentUser = this.getCurrentUser();

    if (!currentUser) {
      return null;
    }

    return this.updateUserInternal(currentUser.id, {
      avatarUrl: dataUrl,
    });
  }

  createUser(payload: CreateUserPayload) {
    this.assertEmailIsUnique(payload.email);

    const now = new Date().toISOString();
    const newUser: UserEntity = {
      id: generateUniqueIdWithTimestamp(),
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      role: payload.role,
      active: payload.active ?? true,
      avatarUrl: null,
      jobTitle: payload.jobTitle?.trim() ?? '',
      department: payload.department?.trim() ?? '',
      bio: payload.bio?.trim() ?? '',
      phone: payload.phone?.trim() ?? '',
      location: payload.location?.trim() ?? '',
      createdAt: now,
      updatedAt: now,
    };

    this.commitUsers([...this._users.value, newUser]);
    this._preferencesService.ensureUserPreferences(newUser.id);
    return this.toSessionUser(newUser);
  }

  updateUser(userId: string, payload: UpdateUserPayload) {
    if (payload.email) {
      this.assertEmailIsUnique(payload.email, userId);
    }

    return this.updateUserInternal(userId, {
      ...payload,
      email: payload.email?.trim().toLowerCase(),
      name: payload.name?.trim(),
      jobTitle: payload.jobTitle?.trim(),
      department: payload.department?.trim(),
      bio: payload.bio?.trim(),
      phone: payload.phone?.trim(),
      location: payload.location?.trim(),
    });
  }

  toggleUserActive(userId: string, active: boolean) {
    const user = this.getUserById(userId);
    if (!user) {
      return null;
    }

    if (!active && user.role === 'admin' && this.countActiveAdmins(userId) === 0) {
      throw new Error('O sistema precisa manter ao menos um admin ativo.');
    }

    const currentUser = this._sessionStore.currentUserSnapshot;
    if (
      currentUser &&
      currentUser.id === userId &&
      user.role === 'admin' &&
      !active &&
      this.countActiveAdmins(userId) === 0
    ) {
      throw new Error('Você não pode desativar o último admin ativo.');
    }

    return this.updateUserInternal(userId, { active });
  }

  changeUserRole(userId: string, role: UserRole) {
    const user = this.getUserById(userId);
    if (!user) {
      return null;
    }

    if (user.role === 'admin' && role !== 'admin' && this.countActiveAdmins(userId) === 0) {
      throw new Error('O sistema precisa manter ao menos um admin ativo.');
    }

    return this.updateUserInternal(userId, { role });
  }

  resetUserPassword(userId: string, password: string) {
    return this.updateUserInternal(userId, { password });
  }

  toSessionUser(user: UserEntity): SessionUser {
    const { password, ...sessionUser } = user;
    return structuredClone(sessionUser);
  }

  private seedUsers() {
    const now = new Date().toISOString();
    const users: UserEntity[] = [
      {
        id: 'seed-admin',
        name: 'GoTask Admin',
        email: 'admin@gotask.local',
        password: '123456',
        role: 'admin',
        active: true,
        avatarUrl: null,
        jobTitle: 'Administrador da plataforma',
        department: 'Operações',
        bio: 'Responsável pela gestão global do workspace.',
        phone: '',
        location: 'Remoto',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'seed-employer',
        name: 'GoTask Employer',
        email: 'employer@gotask.local',
        password: '123456',
        role: 'employer',
        active: true,
        avatarUrl: null,
        jobTitle: 'Employer',
        department: 'Produto',
        bio: 'Usuário padrão para gerenciamento do próprio fluxo.',
        phone: '',
        location: 'Remoto',
        createdAt: now,
        updatedAt: now,
      },
    ];

    this.commitUsers(users);
    users.forEach((user) => this._preferencesService.ensureUserPreferences(user.id));
  }

  private updateUserInternal(userId: string, payload: Partial<UserEntity>) {
    const index = this._users.value.findIndex((user) => user.id === userId);
    if (index < 0) {
      return null;
    }

    const nextUsers = [...this._users.value];
    nextUsers[index] = {
      ...nextUsers[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    this.commitUsers(nextUsers);

    const currentUser = this._sessionStore.currentUserSnapshot;
    if (currentUser?.id === userId) {
      this._sessionStore.setCurrentUser(this.toSessionUser(nextUsers[index]));
    }

    return this.toSessionUser(nextUsers[index]);
  }

  private assertEmailIsUnique(email: string, userIdToIgnore?: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = this._users.value.find(
      (user) =>
        user.email.toLowerCase() === normalizedEmail && user.id !== userIdToIgnore,
    );

    if (existingUser) {
      throw new Error('Já existe um usuário com este email.');
    }
  }

  private countActiveAdmins(userIdToIgnore?: string) {
    return this._users.value.filter(
      (user) =>
        user.role === 'admin' && user.active && user.id !== userIdToIgnore,
    ).length;
  }

  private loadUsers(): UserEntity[] {
    try {
      const rawUsers = localStorage.getItem(STORAGE_KEYS.users);
      return rawUsers ? JSON.parse(rawUsers) : [];
    } catch {
      return [];
    }
  }

  private commitUsers(users: UserEntity[]) {
    this._users.next(structuredClone(users));
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }
}
