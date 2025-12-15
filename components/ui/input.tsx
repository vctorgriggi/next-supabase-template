import { ExclamationCircleIcon } from '@heroicons/react/16/solid';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

import { cn } from '@/lib/utils';

export const inputVariants = cva('block w-full rounded-md bg-background px-3 py-1.5 text-foreground placeholder:text-foreground/40 outline outline-foreground/20 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600sm:text-sm/6',
  {
    variants: {
      variant: {
        default: '',
        error: 'text-red-600 outline-red-500/40 placeholder:text-red-500/40 focus:outline-red-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type InputVariantProps = VariantProps<typeof inputVariants>;

export interface InputWithLabelProps
  extends React.InputHTMLAttributes<HTMLInputElement>, InputVariantProps {
  id: string;
  label: string;
  error?: string | null;
}

const InputWithLabel = React.forwardRef<HTMLInputElement, InputWithLabelProps>(
  ({ id, label, error = null, variant, className, ...props }, ref) => {
    const hasError = Boolean(error);
    const chosenVariant = variant ?? (hasError ? 'error' : 'default');

    return (
      <div>
        <label
          htmlFor={id}
          className="text-foreground block text-sm/6 font-medium"
        >
          {label}
        </label>

        <div className="relative mt-2">
          <input
            id={id}
            ref={ref}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${id}-error` : undefined}
            {...props}
            className={cn(inputVariants({ variant: chosenVariant }), className)}
          />

          {hasError && (
            <ExclamationCircleIcon
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-red-500 sm:h-4 sm:w-4"
            />
          )}
        </div>

        {hasError && (
          <p
            id={`${id}-error`}
            role="alert"
            className="mt-2 text-sm text-red-600"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

InputWithLabel.displayName = 'InputWithLabel';

export default InputWithLabel;
