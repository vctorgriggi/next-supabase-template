export const profileKeys = {
  all: ['profiles'] as const,
  details: () => [...profileKeys.all, 'detail'] as const,
  detail: (userId: string) => [...profileKeys.details(), userId] as const,
};
