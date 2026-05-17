import * as Sentry from "@sentry/nextjs";

export function captureError(err: unknown, context?: Record<string, unknown>): void {
  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => scope.setExtra(key, value));
      Sentry.captureException(err);
    });
  } else {
    Sentry.captureException(err);
  }
}

export function logEvent(name: string, data?: Record<string, unknown>): void {
  Sentry.addBreadcrumb({ category: "app", message: name, data, level: "info" });
}
