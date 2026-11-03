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
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
        This page could not load
      </h1>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex h-11 items-center rounded-full bg-saffron px-5 text-sm font-medium text-white transition-colors hover:bg-saffron-deep"
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
