"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

export function ShareButton({
  name,
  iconOnly = false,
}: {
  name: string;
  iconOnly?: boolean;
}) {
  const { t } = useI18n();

  async function handleShare() {
    const url = window.location.href;
    const title = t("fort.shareText", { name });

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text: title, url });
        return;
      } catch {
        // Falling back to the clipboard keeps share usable where the sheet is blocked.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("fort.shareCopied"));
    } catch {
      toast.error(url);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleShare()}
      aria-label={t("fort.share")}
      className={cn(
        "inline-flex items-center border border-line-strong bg-parchment text-ink-soft transition-colors hover:border-saffron/50 hover:text-saffron-deep",
        iconOnly ? "size-10 justify-center rounded-full" : "h-10 gap-2 rounded-full px-4 text-sm font-medium",
      )}
    >
      <Share2 className="size-4" aria-hidden="true" />
      {iconOnly ? null : t("fort.share")}
    </button>
  );
}
