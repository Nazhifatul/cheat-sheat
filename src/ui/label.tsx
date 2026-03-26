import * as React from "react";

import { cn } from "@/utils/cn";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

function LabelRoot(
  { className, ...props }: LabelProps,
  ref: React.ForwardedRef<HTMLLabelElement>,
) {
  return (
    <label
      ref={ref}
      className={cn("text-sm font-medium text-slate-900", className)}
      {...props}
    />
  );
}

export const Root = React.forwardRef<HTMLLabelElement, LabelProps>(LabelRoot);
