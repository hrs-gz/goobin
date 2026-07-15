"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          fontFamily: "system-ui, sans-serif",
          padding: 24,
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ color: "#8c867c" }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            borderRadius: 999,
            padding: "10px 20px",
            background: "#ef9d8b",
            color: "#4a241b",
            fontWeight: 500,
            border: "none",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
