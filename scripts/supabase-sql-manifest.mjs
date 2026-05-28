import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const supabaseDir = path.join(process.cwd(), "supabase");
const localEnv = await loadLocalEnv();
const env = {
  key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? localEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? localEnv.NEXT_PUBLIC_SUPABASE_URL
};

async function loadLocalEnv() {
  try {
    const raw = await readFile(path.join(process.cwd(), ".env.local"), "utf8");
    return Object.fromEntries(
      raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const index = line.indexOf("=");
          return [line.slice(0, index), line.slice(index + 1)];
        })
    );
  } catch {
    return {};
  }
}

const migrationOrder = [
  "auth_users_schema.sql",
  "centrix_required_core_schema.sql",
  "centrix_data_platform_schema.sql",
  "centrix_saas_core_schema.sql",
  "crm_schema.sql",
  "billing_documents.sql",
  "finance_schema.sql",
  "projects_schema.sql",
  "agenda_schema.sql",
  "hr_schema.sql",
  "documents_cloud_schema.sql",
  "notifications_schema.sql",
  "support_schema.sql",
  "marketing_schema.sql",
  "ai_automation_schema.sql",
  "workflows_schema.sql",
  "business_intelligence_schema.sql",
  "saas_billing_schema.sql",
  "client_portal_schema.sql",
  "marketplace_schema.sql",
  "academy_schema.sql",
  "multi_enterprise_schema.sql",
  "settings_admin_schema.sql",
  "security_schema.sql",
  "sales_schema.sql",
  "enterprise_legal_schema.sql"
];

const requiredTables = [
  "profiles",
  "workspaces",
  "crm_contacts",
  "clients",
  "invoices",
  "projects",
  "tasks",
  "payroll",
  "analytics",
  "notifications",
  "support_tickets",
  "workflows",
  "documents",
  "subscriptions"
];

const moduleTables = {
  auth: ["profiles", "workspaces", "workspace_members"],
  crm: ["crm_contacts", "clients"],
  billing: ["invoices", "subscriptions"],
  projects: ["projects", "tasks"],
  hr: ["employees", "payroll"],
  analytics: ["analytics"],
  notifications: ["notifications"],
  support: ["support_tickets"],
  workflows: ["workflows"],
  documents: ["documents"]
};

const files = (await readdir(supabaseDir)).filter((file) => file.endsWith(".sql")).sort();
const sqlByFile = new Map();
for (const file of files) {
  sqlByFile.set(file, await readFile(path.join(supabaseDir, file), "utf8"));
}

function matchCreateTable(sql, table) {
  return new RegExp(`create\\s+table\\s+if\\s+not\\s+exists\\s+public\\.${table}\\b`, "i").test(sql);
}

function matchRls(sql, table) {
  return new RegExp(`alter\\s+table\\s+public\\.${table}\\s+enable\\s+row\\s+level\\s+security`, "i").test(sql) || (sql.includes(`'${table}'`) && /alter table public\.%I enable row level security/i.test(sql));
}

function matchPolicy(sql, table) {
  return new RegExp(`create\\s+policy\\s+["'][^"']*["']\\s+on\\s+public\\.${table}\\b`, "i").test(sql) || (sql.includes(`'${table}'`) && /create policy.*on public\.%I/i.test(sql));
}

function matchTenantPolicy(sql, table) {
  return matchPolicy(sql, table) && /is_workspace_member|is_workspace_admin|auth\.uid\(\)/i.test(sql);
}

function matchWorkspaceRelation(sql, table) {
  if (["profiles", "workspaces"].includes(table)) return true;
  const tableBlock = sql.match(new RegExp(`create\\s+table\\s+if\\s+not\\s+exists\\s+public\\.${table}\\s*\\(([\\s\\S]*?)\\);`, "i"))?.[1] ?? "";
  return /workspace_id\s+uuid[\s\S]*references\s+public\.workspaces\(id\)/i.test(tableBlock);
}

const coverage = Object.fromEntries(requiredTables.map((table) => [table, []]));
const rls = Object.fromEntries(requiredTables.map((table) => [table, []]));
const policies = Object.fromEntries(requiredTables.map((table) => [table, []]));
const tenantPolicies = Object.fromEntries(requiredTables.map((table) => [table, []]));
const relations = Object.fromEntries(requiredTables.map((table) => [table, []]));

for (const [file, sql] of sqlByFile.entries()) {
  for (const table of requiredTables) {
    if (matchCreateTable(sql, table)) coverage[table].push(file);
    if (matchRls(sql, table)) rls[table].push(file);
    if (matchPolicy(sql, table)) policies[table].push(file);
    if (matchTenantPolicy(sql, table)) tenantPolicies[table].push(file);
    if (matchWorkspaceRelation(sql, table)) relations[table].push(file);
  }
}

async function probeTable(table) {
  if (!env.url || !env.key) return { status: "env_missing" };
  const response = await fetch(`${env.url}/rest/v1/${table}?select=id&limit=1`, {
    headers: {
      apikey: env.key,
      Authorization: `Bearer ${env.key}`
    }
  });
  return {
    status: response.status,
    ok: response.ok,
    note: response.status === 404 ? "missing_or_not_exposed" : response.status === 401 ? "auth_required" : response.ok ? "reachable" : "check_supabase"
  };
}

const cloudProbe = {};
for (const table of requiredTables) {
  cloudProbe[table] = await probeTable(table);
}

const missing = Object.entries(coverage).filter(([, matches]) => matches.length === 0).map(([table]) => table);
const missingRls = Object.entries(rls).filter(([, matches]) => matches.length === 0).map(([table]) => table);
const missingPolicies = Object.entries(policies).filter(([, matches]) => matches.length === 0).map(([table]) => table);
const missingTenantPolicies = Object.entries(tenantPolicies).filter(([, matches]) => matches.length === 0).map(([table]) => table);
const missingRelations = Object.entries(relations).filter(([, matches]) => matches.length === 0).map(([table]) => table);

const modules = Object.fromEntries(
  Object.entries(moduleTables).map(([module, tables]) => [
    module,
    {
      tables,
      sqlReady: tables.every((table) => coverage[table]?.length || !requiredTables.includes(table)),
      cloudReachable: tables.every((table) => cloudProbe[table]?.ok || !requiredTables.includes(table))
    }
  ])
);

console.log(JSON.stringify({
  env: { hasUrl: Boolean(env.url), hasKey: Boolean(env.key), url: env.url ?? null },
  files,
  migrationOrder: migrationOrder.filter((file) => files.includes(file)),
  requiredTables,
  coverage,
  rls,
  policies,
  tenantPolicies,
  relations,
  cloudProbe,
  modules,
  missing,
  missingRls,
  missingPolicies,
  missingTenantPolicies,
  missingRelations
}, null, 2));
