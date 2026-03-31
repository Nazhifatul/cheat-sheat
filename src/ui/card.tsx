import * as React from "react";

import { cn } from "@/utils/cn";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

function CardRoot(
  { className, ...props }: CardProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-3xl border border-slate-200/70 bg-white/75 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/65 dark:border-white/10 dark:bg-white/5 dark:shadow-[0_14px_40px_rgba(0,0,0,0.45)]",
        className,
      )}
      {...props}
    />
  );
}

export const Root = React.forwardRef<HTMLDivElement, CardProps>(CardRoot);

export type CardHeaderProps = React.HTMLAttributes<HTMLDivElement>;

function CardHeaderRoot(
  { className, ...props }: CardHeaderProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <div ref={ref} className={cn("px-4 pt-4", className)} {...props} />
  );
}

export const Header = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  CardHeaderRoot,
);

export type CardBodyProps = React.HTMLAttributes<HTMLDivElement>;

function CardBodyRoot(
  { className, ...props }: CardBodyProps,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <div ref={ref} className={cn("px-4 pb-4", className)} {...props} />
  );
}

export const Body = React.forwardRef<HTMLDivElement, CardBodyProps>(CardBodyRoot);
