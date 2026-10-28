"use client";

import * as React from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  React.useEffect(() => {
    console.error("route_error", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col justify-center px-4 py-16 sm:px-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-saffron-deep">
        Maharashtra Fort Explorer
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
        This page could not load
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
        Something interrupted the request. Try again, or head back to the map and
        pick up where you left off.
      </p>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
        काहीतरी अडचण आली. पुन्हा प्रयत्न करा किंवा नकाशावर परत जा.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex h-11 items-center rounded-full bg-saffron px-5 text-sm font-semibold text-parchment transition-colors hover:bg-saffron-deep"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-full border border-line-strong bg-parchment px-5 text-sm font-medium text-ink-soft transition-colors hover:border-saffron/50 hover:text-saffron-deep"
        >
          Back to the map
        </Link>
      </div>
    </div>
  );
}
