import type { Instrumentation } from "next";

/**
 * Structured server-error logging. Vercel captures stdout/stderr in the
 * deployment logs; point a log drain or an error tracker at that stream.
 * Request headers are deliberately not logged to avoid leaking credentials.
 */
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const message = error instanceof Error ? error.message : String(error);
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String(error.digest)
      : undefined;

  console.error(
    JSON.stringify({
      event: "request_error",
      message,
      digest,
      path: request.path,
      method: request.method,
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
      renderSource: context.renderSource,
      timestamp: new Date().toISOString(),
    }),
  );
};
