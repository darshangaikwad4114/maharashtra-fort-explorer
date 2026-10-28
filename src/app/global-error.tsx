"use client";

import * as React from "react";

export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  React.useEffect(() => {
    console.error("global_error", error);
  }, [error]);

  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String((error as { digest?: unknown }).digest)
      : undefined;

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf6ee",
          color: "#231e19",
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: "24px",
        }}
      >
        <title>Something went wrong · Maharashtra Fort Explorer</title>
        <main style={{ maxWidth: "520px", width: "100%" }}>
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: "#b85423",
            }}
          >
            Maharashtra Fort Explorer
          </p>
          <h1
            style={{
              margin: "10px 0 0",
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: "32px",
              lineHeight: 1.1,
              fontWeight: 600,
            }}
          >
            Something went wrong
          </h1>
          <p style={{ marginTop: "12px", fontSize: "15px", lineHeight: 1.6, color: "#4b4237" }}>
            The page could not be rendered. Try again, or return to the map.
          </p>
          <p style={{ marginTop: "6px", fontSize: "14px", lineHeight: 1.6, color: "#7c7164" }}>
            पृष्ठ दाखवता आले नाही. पुन्हा प्रयत्न करा किंवा नकाशावर परत जा.
          </p>
          {digest ? (
            <p style={{ marginTop: "10px", fontSize: "12px", color: "#7c7164" }}>
              Reference: {digest}
            </p>
          ) : null}
          <div style={{ display: "flex", gap: "10px", marginTop: "24px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => retry()}
              style={{
                border: 0,
                borderRadius: "999px",
                background: "#b85423",
                color: "#faf6ee",
                padding: "12px 22px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            {/* A full page load is intentional here: the router or root layout may be the failing part. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                borderRadius: "999px",
                border: "1px solid #cbbda8",
                background: "#fffdf8",
                color: "#231e19",
                padding: "12px 22px",
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              Back to the map
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
