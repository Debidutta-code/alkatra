import * as React from "react";

import { cn } from "../../lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import { buttonVariants } from "./button";

const inputVariants = cva(
  "flex text-sm placeholder:text-muted-foreground  disabled:cursor-not-allowed disabled:opacity-50 w-full ",
  {
    variants: {
      variant: {
        default:
          "rounded-md border border-input file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background",
        error:
          "rounded-md border border-red-500 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 ring-offset-background",
      },
      size: {
        default: "h-10 px-3 py-2",
        md: "h-12 px-3 py-4",
        lg: "h-16 px-12 py-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  withIcon?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, variant, withIcon, startIcon, endIcon, size, type, ...props },
    ref
  ) => {
    return (
      <div className="relative flex">
        {startIcon && withIcon && (
          <div className="absolute top-1/2 -translate-y-1/2 left-4 text-foreground-500">
            {startIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(inputVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
        {endIcon && withIcon && (
          <div className="absolute top-1/2 -translate-y-1/2 right-4 text-foreground-500">
            {endIcon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
