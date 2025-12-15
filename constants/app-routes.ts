export const APP_ROUTES = {
  PUBLIC: {
    HOME: '/',
  },
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    CONFIRM_EMAIL: '/auth/confirm-email',
  },
  PRIVATE: {
    DASHBOARD: '/dashboard',
    ACCOUNT: '/account',
  },
} as const;
