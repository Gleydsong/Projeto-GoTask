import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { SessionUser } from '../interfaces/session-user.interface';

@Injectable({
  providedIn: 'root',
})
export class SessionStoreService {
  private readonly _currentUser = new BehaviorSubject<SessionUser | null>(null);

  readonly currentUser$ = this._currentUser.asObservable();
  readonly isAuthenticated$ = this._currentUser
    .asObservable()
    .pipe(map((currentUser) => Boolean(currentUser)));
  readonly role$ = this._currentUser
    .asObservable()
    .pipe(map((currentUser) => currentUser?.role ?? null));

  get currentUserSnapshot(): SessionUser | null {
    return this._currentUser.value;
  }

  setCurrentUser(user: SessionUser | null) {
    this._currentUser.next(user ? structuredClone(user) : null);
  }

  clear() {
    this._currentUser.next(null);
  }
}
