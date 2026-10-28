"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type SheetSide = "right" | "left" | "bottom";

const sideClasses: Record<SheetSide, string> = {
  right:
    "inset-y-0 right-0 h-full w-[min(24rem,92vw)] border-l data-[state=open]:animate-[slide-in-right_0.28s_cubic-bezier(0.22,1,0.36,1)]",
  left: "inset-y-0 left-0 h-full w-[min(24rem,92vw)] border-r data-[state=open]:animate-[slide-in-left_0.28s_cubic-bezier(0.22,1,0.36,1)]",
  bottom:
    "inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl border-t data-[state=open]:animate-[slide-in-bottom_0.3s_cubic-bezier(0.22,1,0.36,1)]",
};

export function Sheet({
  open,
  onOpenChange,
  side = "right",
  children,
  className,
  title,
  description,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: SheetSide;
  children: React.ReactNode;
  className?: string;
  title: string;
  description?: string;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[1300] bg-ink/40 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content
          className={cn(
            "fixed z-[1310] flex flex-col border-line-strong bg-parchment shadow-lift focus:outline-none",
            sideClasses[side],
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div>
              <DialogPrimitive.Title className="font-display text-lg font-semibold text-ink">
                {title}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="mt-0.5 text-xs text-ink-muted">
                  {description}
                </DialogPrimitive.Description>
              ) : null}
            </div>
            <DialogPrimitive.Close
              aria-label="Close"
              className="grid size-8 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-parchment-deep hover:text-ink"
            >
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-slim">
            {children}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
