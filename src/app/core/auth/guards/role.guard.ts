import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../../users/interfaces/user-role.type';
import { AuthService } from '../services/auth.service';

export const roleGuard =
  (role: UserRole): CanActivateFn =>
  () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }

    if (authService.hasRole(role)) {
      return true;
    }

    return router.createUrlTree(['/app/tarefas']);
  };
