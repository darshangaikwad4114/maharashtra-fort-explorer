"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/services/supabase";

const STORAGE_KEY = "mfe.favorites.v1";

type FavoritesContextValue = {
  favorites: string[];
  count: number;
  ready: boolean;
  user: User | null;
  syncing: boolean;
  configured: boolean;
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;
  signIn: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const FavoritesContext = React.createContext<FavoritesContextValue | null>(null);

function readLocal(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

function writeLocal(slugs: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // Storage can be unavailable in private modes; the session state still works.
  }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [ready, setReady] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);
  const [syncing, setSyncing] = React.useState(false);

  const mergeWithCloud = React.useCallback(async (nextUser: User) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setSyncing(true);
    try {
      const local = readLocal();
      const { data, error } = await supabase
        .from("favorites")
        .select("fort_slug")
        .eq("user_id", nextUser.id);

      if (error) throw error;

      const remote = (data ?? []).map(
        (row: { fort_slug: string }) => row.fort_slug,
      );
      const merged = Array.from(new Set([...remote, ...local]));

      if (local.length) {
        const rows = local.map((slug) => ({
          user_id: nextUser.id,
          fort_slug: slug,
        }));
        const { error: upsertError } = await supabase
          .from("favorites")
          .upsert(rows, { onConflict: "user_id,fort_slug", ignoreDuplicates: true });
        if (upsertError) throw upsertError;
      }

      setFavorites(merged);
      writeLocal(merged);
    } catch {
      // Keep local favorites; the UI surfaces sync state separately.
    } finally {
      setSyncing(false);
    }
  }, []);

  React.useEffect(() => {
    // Saved forts live in localStorage, which has no server snapshot, so they
    // are restored once after hydration and then reconciled with the account.
    const local = readLocal();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavorites(local);
    setReady(true);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const nextUser = data.session?.user ?? null;
      setUser(nextUser);
      if (nextUser) void mergeWithCloud(nextUser);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!active) return;
        const nextUser = session?.user ?? null;
        setUser(nextUser);
        if (event === "SIGNED_IN" && nextUser) void mergeWithCloud(nextUser);
      },
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [mergeWithCloud]);

  const isFavorite = React.useCallback(
    (slug: string) => favorites.includes(slug),
    [favorites],
  );

  const toggleFavorite = React.useCallback(
    (slug: string) => {
      const next = favorites.includes(slug)
        ? favorites.filter((item) => item !== slug)
        : [...favorites, slug];

      setFavorites(next);
      writeLocal(next);

      if (!user) return;
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      const request = favorites.includes(slug)
        ? supabase
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("fort_slug", slug)
        : supabase
            .from("favorites")
            .upsert(
              { user_id: user.id, fort_slug: slug },
              { onConflict: "user_id,fort_slug", ignoreDuplicates: true },
            );

      void request.then(({ error }) => {
        if (error) {
          console.warn("Favorite sync failed; kept locally.", error.message);
        }
      });
    },
    [favorites, user],
  );

  const signIn = React.useCallback(async (email: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return { error: "not-configured" };
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== "undefined" ? window.location.href : undefined,
      },
    });
    return { error: error ? error.message : null };
  }, []);

  const signOut = React.useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = React.useMemo(
    () => ({
      favorites,
      count: favorites.length,
      ready,
      user,
      syncing,
      configured: isSupabaseConfigured,
      isFavorite,
      toggleFavorite,
      signIn,
      signOut,
    }),
    [
      favorites,
      ready,
      user,
      syncing,
      isFavorite,
      toggleFavorite,
      signIn,
      signOut,
    ],
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = React.useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }
  return ctx;
}
