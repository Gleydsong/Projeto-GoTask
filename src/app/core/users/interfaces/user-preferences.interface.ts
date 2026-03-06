import { DefaultAppRoute } from './default-app-route.type';

export interface UserPreferences {
  userId: string;
  showWelcomeBanner: boolean;
  compactTaskCards: boolean;
  inAppNotifications: boolean;
  defaultRoute: DefaultAppRoute;
}
