"use client";

import { useEffect } from "react";

export function ProductionMonitor() {
  useEffect(() => {
    const report = (type: string, payload: unknown) => {
      console.error(`[CENTRIX_${type}]`, payload);
    };

    const onError = (event: ErrorEvent) => report("CLIENT_ERROR", { message: event.message, source: event.filename, line: event.lineno });
    const onRejection = (event: PromiseRejectionEvent) => report("PROMISE_REJECTION", { reason: event.reason });

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
