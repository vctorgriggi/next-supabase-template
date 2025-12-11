'use client';

import {
  type DehydratedState,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { HydrationBoundary } from '@tanstack/react-query';
import React from 'react';

export default function QueryProvider({
  children,
  dehydratedState,
}: Readonly<{
  children: React.ReactNode;
  dehydratedState?: DehydratedState;
}>) {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
    </QueryClientProvider>
  );
}
