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
      "bg-[#FFB86B] text-slate-950 shadow-sm hover:bg-[#FFB86B]/90 active:bg-[#FFB86B]/90",
    stroke:
      "border border-[#FFB86B]/35 bg-white/70 text-slate-950 hover:bg-white/80 active:bg-white/80 dark:border-[#FFB86B]/25 dark:bg-white/5 dark:text-[#FFE7CE] dark:hover:bg-white/10 dark:active:bg-white/10",
    lighter:
      "bg-[#FFB86B]/20 text-[#FFDCB3] hover:bg-[#FFB86B]/25 active:bg-[#FFB86B]/25",
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
        "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7DD3FC]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-[#0B0F14]",
        sizeClass[size],
        variantClass[variant][mode],
        className,
      )}
      {...props}
    />
  );
}

export const Root = React.forwardRef<HTMLButtonElement, ButtonProps>(ButtonRoot);
