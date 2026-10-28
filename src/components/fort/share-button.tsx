"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/components/providers/locale-provider";

export function ShareButton({ name }: { name: string }) {
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
      className="inline-flex h-10 items-center gap-2 rounded-full border border-line-strong bg-parchment px-4 text-sm font-medium text-ink-soft transition-colors hover:border-saffron/50 hover:text-saffron-deep"
    >
      <Share2 className="size-4" aria-hidden="true" />
      {t("fort.share")}
    </button>
  );
}
