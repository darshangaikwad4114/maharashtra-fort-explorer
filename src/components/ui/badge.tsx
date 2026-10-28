import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-5 tracking-wide",
  {
    variants: {
      variant: {
        default: "border-line-strong bg-parchment-deep text-ink-soft",
        saffron: "border-saffron/30 bg-saffron-soft text-saffron-deep",
        forest: "border-forest/25 bg-forest-soft text-forest",
        gold: "border-gold/30 bg-gold-soft text-[#6f5316]",
        flag: "border-flag/30 bg-[#f4dfd9] text-flag",
        outline: "border-line-strong bg-transparent text-ink-muted",
        solid: "border-transparent bg-ink text-parchment",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
