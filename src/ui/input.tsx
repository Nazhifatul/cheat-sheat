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
        "w-full appearance-none border border-slate-300 bg-white text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(15,23,42,0.04)] outline-none transition-colors placeholder:text-slate-400 placeholder:opacity-100 focus:border-[#0f766e]/45 focus:bg-white focus:ring-4 focus:ring-[#0f766e]/12 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400",
        sizeClass[uiSize],
        className,
      )}
      {...props}
    />
  );
}

export const Root = React.forwardRef<HTMLInputElement, InputProps>(InputRoot);
