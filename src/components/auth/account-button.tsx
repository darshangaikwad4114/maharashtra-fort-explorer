"use client";

import * as React from "react";
import { LogOut, Mail, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useFavorites } from "@/components/providers/favorites-provider";
import { useI18n } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";

export function AccountButton({ withLabel = false }: { withLabel?: boolean }) {
  const { t } = useI18n();
  const { user, configured, signIn, signOut, syncing } = useFavorites();
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent">(
    "idle",
  );
  const [error, setError] = React.useState<string | null>(null);

  // Without Supabase credentials there is no account system to offer.
  if (!configured) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("auth.invalid"));
      return;
    }

    setStatus("sending");
    const result = await signIn(email.trim());
    if (result.error) {
      setStatus("idle");
      setError(
        result.error === "not-configured"
          ? t("auth.notConfigured")
          : result.error,
      );
      return;
    }
    setStatus("sent");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={t("auth.account")}
          className={cn(
            "inline-flex items-center justify-center gap-1.5 rounded-full border border-line-strong bg-parchment text-ink-soft transition-colors hover:bg-parchment-deep hover:text-ink",
            withLabel ? "h-10 px-4 text-xs font-medium" : "size-9",
          )}
        >
          {user ? (
            <span className="text-xs font-semibold uppercase">
              {(user.email ?? "?").slice(0, 1)}
            </span>
          ) : (
            <UserRound className="size-4" aria-hidden="true" />
          )}
          {withLabel ? (
            <span className="max-w-[180px] truncate">
              {user?.email ?? t("favorites.signIn")}
            </span>
          ) : null}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("auth.title")}</DialogTitle>
          <DialogDescription>{t("auth.body")}</DialogDescription>
        </DialogHeader>

        {user ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-line bg-parchment-deep/70 p-4">
              <p className="text-xs uppercase tracking-wide text-ink-muted">
                {t("auth.account")}
              </p>
              <p className="mt-1 break-all text-sm font-medium text-ink">
                {t("auth.signedInAs", { email: user.email ?? "" })}
              </p>
              <p className="mt-2 text-xs text-ink-muted">
                {syncing ? t("auth.syncing") : t("favorites.offlineNote")}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void signOut()}
              className="w-full"
            >
              <LogOut aria-hidden="true" />
              {t("auth.signOut")}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <label
              htmlFor="account-email"
              className="block text-xs font-medium uppercase tracking-wide text-ink-muted"
            >
              {t("auth.email")}
            </label>
            <div className="relative">
              <Mail
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
              />
              <Input
                id="account-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="pl-9"
                disabled={status === "sending"}
              />
            </div>

            {error ? (
              <p role="alert" className="text-xs text-flag">
                {error}
              </p>
            ) : null}

            {status === "sent" ? (
              <p
                role="status"
                className="rounded-lg border border-forest/25 bg-forest-soft px-3 py-2 text-xs text-forest"
              >
                {t("auth.sent")}
              </p>
            ) : null}

            <Button
              type="submit"
              className="w-full"
              disabled={status === "sending"}
            >
              {status === "sending" ? t("auth.sending") : t("auth.send")}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
