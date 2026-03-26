import * as React from "react";

import { cn } from "@/utils/cn";

type InputSize = "md" | "lg";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  uiSize?: InputSize;
};

const sizeClass: Record<InputSize, string> = {
  md: "h-10 rounded-xl px-3 text-sm",
  lg: "h-11 rounded-2xl px-4 text-base",
};

function InputRoot(
  { className, uiSize = "lg", type = "text", ...props }: InputProps,
  ref: React.ForwardedRef<HTMLInputElement>,
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "w-full border border-slate-200 bg-white text-slate-950 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-50 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 dark:disabled:bg-slate-900/40 dark:disabled:text-slate-400",
        sizeClass[uiSize],
        className,
      )}
      {...props}
    />
  );
}

export const Root = React.forwardRef<HTMLInputElement, InputProps>(InputRoot);
