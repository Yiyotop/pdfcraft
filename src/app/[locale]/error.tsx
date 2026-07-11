"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { logger } from "@/lib/utils/logger";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const isDev = process.env.NODE_ENV !== "production";

  useEffect(() => {
    logger.error("Page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[hsl(var(--color-background))]">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[hsl(var(--color-foreground))]">
            Something went wrong
          </h1>
          <p className="text-[hsl(var(--color-muted-foreground))]">
            An unexpected error occurred. Please try again.
          </p>
          {(isDev || error.digest) && (
            <p className="text-xs text-[hsl(var(--color-muted-foreground))] font-mono break-all">
              {error.message || "Unknown runtime error"}
            </p>
          )}
          {error.digest && (
            <p className="text-xs text-[hsl(var(--color-muted-foreground))] font-mono">
              Error ID: {error.digest}
            </p>
          )}
          {isDev && error.stack && (
            <details className="text-left mt-3 rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-muted)/0.3)] p-3">
              <summary className="cursor-pointer text-xs font-semibold text-[hsl(var(--color-foreground))]">
                View traceback
              </summary>
              <pre className="mt-2 text-[11px] leading-5 whitespace-pre-wrap break-words text-[hsl(var(--color-muted-foreground))]">
                {error.stack}
              </pre>
            </details>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--color-primary))] text-[hsl(var(--color-primary-foreground))] font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--color-secondary))] text-[hsl(var(--color-secondary-foreground))] font-medium hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Go home
          </button>
        </div>
      </div>
    </div>
  );
}
