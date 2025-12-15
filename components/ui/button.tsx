import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

import { cn } from '@/lib/utils';

export const buttonVariants = cva('inline-flex items-center justify-center rounded-md font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-600',
        secondary:'bg-background text-foreground outline outline-foreground/20 hover:bg-foreground/5',
        soft: 'bg-indigo-600/10 text-indigo-600 hover:bg-indigo-600/20',
        text: 'bg-transparent text-foreground hover:text-foreground/70',
        error: 'bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600',
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
