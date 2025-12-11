import { ExclamationCircleIcon } from '@heroicons/react/16/solid';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

import { cn } from '@/lib/utils';

export const inputVariants = cva(
  'block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500',
  {
    variants: {
      variant: {
        default: '', // keep base styles
        error:
          'text-red-900 outline-red-300 placeholder:text-red-300 focus:outline-red-600 dark:text-red-400 dark:outline-red-500/50 dark:placeholder:text-red-400/70 dark:focus:outline-red-400',
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
          className="block text-sm/6 font-medium text-gray-900 dark:text-white"
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
              className="pointer-events-none absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-red-500 sm:h-4 sm:w-4 dark:text-red-400"
            />
          )}
        </div>

        {hasError && (
          <p
            id={`${id}-error`}
            role="alert"
            className="mt-2 text-sm text-red-600 dark:text-red-400"
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
