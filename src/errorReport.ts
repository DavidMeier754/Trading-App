/**
 * Where a crash goes once it is caught (review S23, S47). Nothing is sent
 * anywhere yet: stage ANALYTICS plugs its crash reporter in here with
 * `setErrorReporter`, and every caught render error already arrives.
 */
export type ErrorReport = { error: Error; componentStack: string | null };

type Reporter = (report: ErrorReport) => void;

let reporter: Reporter | null = null;

/** Stage ANALYTICS: the crash reporter that receives every caught error. */
export function setErrorReporter(next: Reporter | null): void {
  reporter = next;
}

export function reportError(report: ErrorReport): void {
  try {
    reporter?.(report);
  } catch {
    // A reporter that fails must never take the error page down with it.
  }
}
