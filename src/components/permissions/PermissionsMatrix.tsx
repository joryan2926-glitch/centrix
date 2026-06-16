"use client";

import { Check, LockKeyhole, Save, ShieldCheck, WandSparkles, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { permissionCatalog } from "@/data/permissionCatalog";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseContext } from "@/providers/SupabaseProvider";
import { applyPermissionTemplate, configurablePermissionRoles, defaultsForRole, loadPermissionMatrix, saveModulePermission, type ConfigurablePermissionRole, type PermissionSet } from "@/services/permissions/supabase";
import type { ModulePermission } from "@/types/operations";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";

const roleLabels: Record<ConfigurablePermissionRole, string> = {
  client: "Client",
  employee: "Employe",
  manager: "Manager",
  user: "User"
};
const actions = [
  ["can_read", "Lecture"],
  ["can_create", "Creation"],
  ["can_update", "Modification"],
  ["can_delete", "Suppression"],
  ["can_export", "Export"],
  ["can_manage", "Administration"]
] as const;
const moduleKeys = Object.keys(permissionCatalog);

export function PermissionsMatrix() {
  const { canManageWorkspace } = useAuth();
  const { supabase } = useSupabaseContext();
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const notify = useCallback((value: string) => {
    setMessage(value);
    window.setTimeout(() => setMessage(null), 3200);
  }, []);
  const refresh = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const result = await loadPermissionMatrix(supabase);
    setPermissions(result.permissions);
    setLoading(false);
  }, [supabase]);
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const map = useMemo(() => new Map(permissions.map((permission) => [`${permission.module_key}:${permission.role}`, permission])), [permissions]);

  function value(moduleKey: string, role: ConfigurablePermissionRole): PermissionSet {
    return map.get(`${moduleKey}:${role}`) ?? defaultsForRole(role);
  }

  async function toggle(moduleKey: string, role: ConfigurablePermissionRole, action: keyof PermissionSet) {
    if (!supabase || !canManageWorkspace) return;
    const next = { ...value(moduleKey, role), [action]: !value(moduleKey, role)[action] };
    setSaving(true);
    const result = await saveModulePermission(supabase, { module_key: moduleKey, role, ...next });
    await refresh();
    setSaving(false);
    notify(result.error ?? "Permission mise a jour.");
  }

  async function applyTemplate(template: "balanced" | "restricted" | "collaborative") {
    if (!supabase || !canManageWorkspace) return;
    setSaving(true);
    const result = await applyPermissionTemplate(supabase, moduleKeys, template);
    await refresh();
    setSaving(false);
    notify(result.error ?? "Modele de permissions applique.");
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-[580px]" /></div>;

  return (
    <div className="mx-auto max-w-[1700px] space-y-6">
      {message ? <Toast detail={message} title="Permissions" /> : null}
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge tone="violet">Zero trust access control</Badge>
            <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">Matrice des permissions</h1>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-600">Configurez précisément les droits par module et par rôle. Les règles sont appliquées côté interface, API et Supabase RLS.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled={!canManageWorkspace || saving} onClick={() => void applyTemplate("restricted")}><LockKeyhole size={16} /> Restreint</Button>
            <Button disabled={!canManageWorkspace || saving} onClick={() => void applyTemplate("balanced")}><ShieldCheck size={16} /> Equilibre</Button>
            <Button disabled={!canManageWorkspace || saving} onClick={() => void applyTemplate("collaborative")} variant="primary"><WandSparkles size={16} /> Collaboratif</Button>
          </div>
        </div>
      </Card>

      <Card className="min-w-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px] text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="sticky left-0 z-20 bg-slate-50 px-5 py-4">Module</th>
                {configurablePermissionRoles.flatMap((role) => actions.map(([, label]) => <th className="px-3 py-4 text-center" key={`${role}-${label}`}><span className="block text-slate-900">{roleLabels[role]}</span><span className="mt-1 block text-[10px] text-slate-400">{label}</span></th>))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {moduleKeys.map((moduleKey) => (
                <tr className="hover:bg-blue-50/50" key={moduleKey}>
                  <td className="sticky left-0 bg-white px-5 py-4"><p className="font-black text-slate-950">{permissionCatalog[moduleKey]}</p><p className="mt-1 text-xs font-semibold text-slate-500">{moduleKey}</p></td>
                  {configurablePermissionRoles.flatMap((role) => actions.map(([action]) => {
                    const enabled = value(moduleKey, role)[action];
                    return <td className="px-3 py-4 text-center" key={`${moduleKey}-${role}-${action}`}><button aria-label={`${moduleKey} ${role} ${action}`} className={`mx-auto grid h-8 w-8 place-items-center rounded-[10px] border transition ${enabled ? "border-blue-200 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-300"} ${canManageWorkspace ? "hover:scale-105" : "cursor-not-allowed opacity-60"}`} disabled={!canManageWorkspace || saving} onClick={() => void toggle(moduleKey, role, action)} type="button">{enabled ? <Check size={15} /> : <X size={15} />}</button></td>;
                  }))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4 text-sm font-semibold text-slate-500"><span>Les administrateurs conservent tous les droits.</span><span className="flex items-center gap-2"><Save size={15} /> Sauvegarde cloud immediate</span></div>
      </Card>
    </div>
  );
}
