import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-6xl font-semibold text-ink-muted">404</p>
      <h1 className="mt-4 font-display text-3xl font-semibold text-ink">
        This path ends here
      </h1>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-full bg-saffron px-6 text-sm font-medium text-white transition-colors hover:bg-saffron-deep"
      >
        Back to the map
      </Link>
    </div>
  );
}
