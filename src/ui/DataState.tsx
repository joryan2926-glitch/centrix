import type { ReactNode } from "react";
import { AlertCircle, Database, Loader2 } from "lucide-react";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Skeleton } from "@/ui/Skeleton";

type DataStateProps = {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyTitle?: string;
  emptyDetail?: string;
  onRetry?: () => void;
  children: ReactNode;
};

export function DataState({ loading, error, empty, emptyTitle = "Aucune donnee", emptyDetail = "Ajoutez une premiere entree pour activer ce module.", onRetry, children }: DataStateProps) {
  if (loading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="grid place-items-center p-8 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-[16px] bg-rose-50 text-rose-600">
          <AlertCircle size={22} />
        </div>
        <h3 className="mt-4 text-lg font-black text-slate-950">Connexion data interrompue</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{error}</p>
        {onRetry ? (
          <Button className="mt-5" onClick={onRetry}>
            <Loader2 size={16} />
            Recharger
          </Button>
        ) : null}
      </Card>
    );
  }

  if (empty) {
    return (
      <Card className="grid place-items-center p-8 text-center">
        <div className="grid h-12 w-12 place-items-center rounded-[16px] bg-blue-50 text-blue-600">
          <Database size={22} />
        </div>
        <h3 className="mt-4 text-lg font-black text-slate-950">{emptyTitle}</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{emptyDetail}</p>
      </Card>
    );
  }

  return <>{children}</>;
}
