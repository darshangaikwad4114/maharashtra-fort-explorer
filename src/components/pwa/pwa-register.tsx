"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // A worker left over from a local production run serves stale chunks to
      // the dev server, which shows up as hydration mismatches.
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((registration) => registration.unregister())),
        )
        .then(() => ("caches" in window ? caches.keys() : []))
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .catch(() => {
          // Dev-time cleanup is best effort.
        });
      return;
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Offline support is progressive; ignore registration failures.
      });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
