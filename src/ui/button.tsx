import * as React from "react";

import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "neutral";
type ButtonMode = "filled" | "stroke" | "ghost" | "lighter";
type ButtonSize = "sm" | "md";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  mode?: ButtonMode;
  size?: ButtonSize;
};

const variantClass: Record<ButtonVariant, Record<ButtonMode, string>> = {
  primary: {
    filled:
      "bg-blue-600 text-white shadow-sm hover:bg-blue-700 active:bg-blue-700",
    stroke:
      "border border-blue-200 bg-white text-blue-700 hover:bg-blue-50 active:bg-blue-50 dark:border-blue-800/40 dark:bg-slate-950/30 dark:text-blue-200 dark:hover:bg-slate-900/40 dark:active:bg-slate-900/40",
    lighter:
      "bg-blue-50 text-blue-700 hover:bg-blue-100 active:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-200 dark:hover:bg-blue-500/15 dark:active:bg-blue-500/15",
    ghost: "bg-transparent text-blue-700 hover:bg-blue-50 active:bg-blue-50",
  },
  neutral: {
    filled:
      "bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 active:bg-zinc-800",
    stroke:
      "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 active:bg-zinc-50 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-100 dark:hover:bg-slate-900/40 dark:active:bg-slate-900/40",
    lighter:
      "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:bg-zinc-200 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15 dark:active:bg-white/15",
    ghost:
      "bg-transparent text-zinc-900 hover:bg-zinc-100 active:bg-zinc-100 dark:text-slate-100 dark:hover:bg-white/10 dark:active:bg-white/10",
  },
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm rounded-xl",
  md: "h-11 px-4 text-sm rounded-xl",
};

function ButtonRoot(
  {
    className,
    variant = "primary",
    mode = "filled",
    size = "md",
    type = "button",
    disabled,
    ...props
  }: ButtonProps,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-blue-400/30 dark:focus-visible:ring-offset-slate-950",
        sizeClass[size],
        variantClass[variant][mode],
        className,
      )}
      {...props}
    />
  );
}

export const Root = React.forwardRef<HTMLButtonElement, ButtonProps>(ButtonRoot);
