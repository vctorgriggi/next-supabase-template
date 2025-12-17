'use client';

import {
  type DehydratedState,
  QueryClientProvider,
} from '@tanstack/react-query';
import { HydrationBoundary } from '@tanstack/react-query';
import React from 'react';

import { createQueryClient } from './query-client';

export function SsrQueryProvider({
  children,
  dehydratedState,
}: {
  children: React.ReactNode;
  dehydratedState?: DehydratedState;
}) {
  const [client] = React.useState(() => {
    const qc = createQueryClient();

    qc.setDefaultOptions({
      queries: {
        queryFn: async () => {
          throw new Error('queryFn not provided: this subtree requires server prefetch.');
        },
      },
    });

    return qc;
  });

  return (
    <QueryClientProvider client={client}>
      <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
    </QueryClientProvider>
  );
}
