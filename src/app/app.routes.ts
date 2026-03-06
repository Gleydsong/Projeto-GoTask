import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './pages/layouts/auth-layout/auth-layout.component';
import { AppLayoutComponent } from './pages/layouts/app-layout/app-layout.component';
import { LoginPageComponent } from './pages/auth/login/login-page.component';
import { TasksPageComponent } from './pages/tasks/tasks-page.component';
import { UserShellComponent } from './pages/user/user-shell/user-shell.component';
import { ProfilePageComponent } from './pages/user/profile/profile-page.component';
import { ToolsPageComponent } from './pages/user/tools/tools-page.component';
import { HistoryPageComponent } from './pages/user/history/history-page.component';
import { AdminUsersPageComponent } from './pages/admin/users/admin-users-page.component';
import { RoutePlaceholderComponent } from './core/shared/components/route-placeholder/route-placeholder.component';
import { authGuard } from './core/auth/guards/auth.guard';
import { defaultAppRouteGuard } from './core/auth/guards/default-app-route.guard';
import { guestOnlyGuard } from './core/auth/guards/guest-only.guard';
import { roleGuard } from './core/auth/guards/role.guard';
import { rootRedirectGuard } from './core/auth/guards/root-redirect.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [rootRedirectGuard],
    component: RoutePlaceholderComponent,
  },
  {
    path: 'login',
    component: AuthLayoutComponent,
    canActivate: [guestOnlyGuard],
    children: [{ path: '', component: LoginPageComponent }],
  },
  {
    path: 'app',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        canActivate: [defaultAppRouteGuard],
        component: RoutePlaceholderComponent,
      },
      {
        path: 'tarefas',
        component: TasksPageComponent,
      },
      {
        path: 'usuario',
        component: UserShellComponent,
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'perfil',
          },
          {
            path: 'perfil',
            component: ProfilePageComponent,
          },
          {
            path: 'ferramentas',
            component: ToolsPageComponent,
          },
          {
            path: 'historico',
            component: HistoryPageComponent,
          },
        ],
      },
      {
        path: 'admin',
        canActivate: [roleGuard('admin')],
        children: [
          {
            path: 'usuarios',
            component: AdminUsersPageComponent,
          },
        ],
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
