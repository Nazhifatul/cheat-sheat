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
        "rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/10",
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
