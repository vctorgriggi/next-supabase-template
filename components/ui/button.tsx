import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'rounded-md px-3 py-2 text-sm font-semibold shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 dark:shadow-none disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:
          'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500',
        secondary:
          'bg-white text-gray-900 inset-ring inset-ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:inset-ring-white/5 dark:hover:bg-white/20',
        soft: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-400 dark:hover:bg-indigo-500/30',
        text: 'bg-transparent shadow-none text-gray-900 hover:text-gray-700 focus-visible:outline-indigo-600 dark:text-white dark:hover:text-gray-300',
        error:
          'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600 dark:bg-red-500 dark:hover:bg-red-400 dark:focus-visible:outline-red-500',
      },
      size: {
        sm: 'text-xs px-2 py-1.5',
        md: 'text-sm px-3 py-2',
        lg: 'text-base px-3.5 py-2.5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export default Button;
