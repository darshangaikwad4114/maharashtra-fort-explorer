import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-line-strong bg-parchment px-3.5 py-2 text-sm text-ink shadow-[inset_0_1px_2px_rgb(35_30_25_/_0.04)] transition-colors placeholder:text-ink-muted/80 focus-visible:border-saffron focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron/20 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
