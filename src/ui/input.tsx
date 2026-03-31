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
        "w-full border border-slate-200/70 bg-white/85 text-slate-950 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-500/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:border-white/10 dark:bg-black/20 dark:text-white/90 dark:placeholder:text-white/35 dark:focus:border-[#7DD3FC]/45 dark:focus:ring-[#7DD3FC]/20 dark:disabled:bg-white/5 dark:disabled:text-white/40",
        sizeClass[uiSize],
        className,
      )}
      {...props}
    />
  );
}

export const Root = React.forwardRef<HTMLInputElement, InputProps>(InputRoot);
