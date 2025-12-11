export const APP_ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  PRIVATE: {
    DASHBOARD: '/dashboard',
    ACCOUNT: '/account',
  },
} as const;
