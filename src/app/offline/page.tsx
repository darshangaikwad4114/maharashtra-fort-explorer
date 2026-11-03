import Link from "next/link";
import { BrandMark } from "@/components/layout/brand";

export const metadata = {
  title: "Offline",
  description: "This page is not available offline yet.",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center px-6 text-center">
      <BrandMark className="size-14" />
      <h1 className="mt-6 font-display text-3xl font-semibold text-ink">
        You are offline
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
        Pages you have already visited stay available.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-full bg-saffron px-6 text-sm font-medium text-white transition-colors hover:bg-saffron-deep"
      >
        Back to the map
      </Link>
    </div>
  );
}
