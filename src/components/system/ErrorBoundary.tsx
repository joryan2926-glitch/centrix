"use client";

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";

type ErrorBoundaryState = {
  failed: boolean;
};

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[CENTRIX_RUNTIME_ERROR]", { error, info });
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="grid min-h-[60vh] place-items-center p-6">
        <Card className="max-w-lg p-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-[16px] bg-rose-50 text-rose-600">
            <AlertTriangle size={22} />
          </div>
          <h1 className="mt-5 text-2xl font-black text-slate-950">CENTRIX a rencontre une erreur</h1>
          <p className="mt-3 text-sm font-medium leading-6 text-slate-500">Le module est protege par un fallback UI. Rechargez la page pour reprendre votre session.</p>
          <Button className="mt-6" onClick={() => window.location.reload()} variant="primary">
            Recharger
          </Button>
        </Card>
      </div>
    );
  }
}
