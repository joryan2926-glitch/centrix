import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Card } from "@/ui/Card";

export default function UnauthorizedPage() {
  return (
    <main className="grid min-h-[calc(100vh-9rem)] place-items-center">
      <Card className="max-w-xl p-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-[20px] bg-rose-50 text-rose-600">
          <ShieldAlert size={30} />
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-[-0.04em] text-slate-950">Acces reserve</h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
          Votre profil CENTRIX ne permet pas d&apos;ouvrir cette zone. Demandez un acces responsable d&apos;entreprise ou revenez au dashboard.
        </p>
        <div className="mt-6 flex justify-center">
          <Link className="inline-flex h-11 items-center justify-center rounded-[13px] bg-gradient-to-r from-[#2563EB] via-[#0B7CFF] to-[#2563EB] px-4 text-sm font-extrabold text-white shadow-[0_16px_36px_rgba(37,99,235,0.30)] transition hover:-translate-y-0.5" href="/dashboard">
            Retour dashboard
          </Link>
        </div>
      </Card>
    </main>
  );
}
