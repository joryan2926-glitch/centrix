import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import fs from "node:fs";

const args = new Set(process.argv.slice(2));
const targetArg = process.argv.find((arg) => arg.startsWith("--target="));
const target = (targetArg?.split("=")[1] ?? process.env.CENTRIX_RECIPE_TARGET ?? "https://app-centrix.fr").replace(/\/$/, "");
const external = args.has("--external");
const sendEmail = args.has("--send-email");
const json = args.has("--json");
const HTTP_CHECK_TIMEOUT_MS = 15_000;
const SUPABASE_CHECK_TIMEOUT_MS = 20_000;
const RECIPE_STEP_TIMEOUT_MS = 120_000;

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  : null;

const marker = `RECETTE-PROD-${Date.now()}`;
const now = new Date().toISOString();
const today = now.slice(0, 10);
const tomorrow = new Date(Date.now() + 86_400_000).toISOString();
const later = new Date(Date.now() + 90_000_000).toISOString();
const results = [];
const cleanup = [];

const tables = [
  "profiles", "workspaces", "workspace_members", "roles", "permissions", "role_permissions", "module_permissions", "plan_modules", "subscription_plans", "subscriptions",
  "clients", "prospects", "crm_contacts", "crm_leads", "crm_clients", "crm_notes", "crm_tasks", "crm_activities", "quotes", "invoices", "billing_documents",
  "projects", "project_members", "tasks", "task_comments", "task_checklists", "project_files", "project_activity", "project_notifications", "time_tracking",
  "employees", "payroll", "hr_employees", "hr_contracts", "hr_leaves", "hr_absences", "hr_salaries", "hr_documents", "hr_schedule", "hr_notifications",
  "meetings", "calendars", "calendar_events", "event_participants", "reservations", "reminders", "event_comments", "availability_slots",
  "financial_settings", "accounting_categories", "bank_accounts", "transactions", "expenses", "revenues", "accounting_entries", "tax_records", "financial_reports", "bridge_connections",
  "marketing_social_accounts", "marketing_posts", "marketing_campaigns", "marketing_media_assets", "marketing_activities", "marketing_reports", "social_publication_logs",
  "workflows", "workflow_steps", "workflow_blocks", "workflow_connections", "workflow_runs", "workflow_templates", "productivity_tasks", "workflow_alerts", "automation_logs",
  "ai_conversations", "ai_messages", "ai_generations", "ai_templates", "ai_notifications",
  "folders", "documents", "document_shares", "document_comments", "document_versions", "storage_usage", "document_tags", "document_notifications",
  "support_tickets", "support_messages", "support_comments", "support_agents", "support_categories", "support_articles", "support_feedback", "support_notifications",
  "marketplace_services", "service_categories", "providers", "provider_reviews", "marketplace_orders", "order_messages", "payouts", "marketplace_notifications", "provider_portfolios",
  "courses", "course_modules", "lessons", "quizzes", "quiz_results", "enrollments", "certificates", "community_posts", "community_comments", "student_progress", "academy_notifications",
  "api_keys", "api_logs", "webhooks", "webhook_logs", "integrations", "oauth_connections", "api_permissions", "api_rate_limits", "integration_notifications", "integration_deliveries", "external_connections",
  "docusign_connections", "docusign_signature_requests",
  "security_logs", "user_sessions", "login_attempts", "security_alerts", "api_security_logs", "user_permissions", "audit_logs", "backups", "gdpr_requests",
  "enterprise_companies", "franchises", "enterprise_users", "enterprise_permissions", "enterprise_metrics", "enterprise_activities",
  "legal_forms", "companies", "legal_documents", "legal_announcements", "shareholders", "company_steps", "company_settings", "capital_deposits", "legal_notifications", "company_development_plans", "advisory_sessions",
  "realtime_notifications", "notification_preferences", "notification_rules", "collaboration_conversations", "collaboration_messages", "user_presence", "shared_files", "notifications", "messages", "analytics", "module_records", "module_record_history"
];

await main();

async function main() {
  await recipe("Configuration locale", async () => ({
    supabaseUrl: maskUrl(supabaseUrl),
    serviceRoleKey: Boolean(serviceRoleKey),
    target,
    external,
    sendEmail
  }), true);

  await recipe("Production /api/health", async () => getJson(`${target}/api/health`), true);
  await recipe("Audit Supabase tables", auditTables, true);
  await recipe("Permissions et entitlements", verifyPermissions, true);
  await recipe("CRUD global modules", runCrudRecipes, true);
  await recipe("Integrations externes", runIntegrationRecipes, true);

  await cleanupRows();
  printReport();

  process.exit(results.some((result) => result.status === "failed") ? 1 : 0);
}

async function runCrudRecipes() {
  assertSupabase();
  const context = await getContext();
  const passed = [];
  const failed = [];

  for (const item of [
    ["Core CRM/Clients/Facturation/Projets", () => coreBusinessCrud(context)],
    ["CRM specialise", () => crmCrud()],
    ["Finance/Banque", () => financeCrud(context)],
    ["RH", () => hrCrud(context)],
    ["Agenda/Reservations", () => agendaCrud(context)],
    ["Marketing/Reseaux sociaux", () => marketingCrud(context)],
    ["Support", () => supportCrud(context)],
    ["Documents/Cloud", () => documentsCrud(context)],
    ["Marketplace", () => marketplaceCrud(context)],
    ["Academy", () => academyCrud(context)],
    ["IA/Workflows", () => aiWorkflowsCrud(context)],
    ["API/Integrations", () => integrationsCrud(context)],
    ["Cybersecurite", () => securityCrud(context)],
    ["Notifications/Collaboration", () => notificationsCrud(context)],
    ["Juridique/Creation entreprise", () => legalCrud(context)],
    ["Sous-modules operationnels", () => operationalCrud(context)]
  ]) {
    const [name, fn] = item;
    try {
      passed.push({ name, detail: await fn() });
    } catch (error) {
      failed.push({ name, error: error.message });
    }
  }

  if (failed.length) throw Object.assign(new Error(`${failed.length} recette(s) CRUD en erreur`), { detail: { passed, failed } });
  return { passed: passed.length, failed: 0, modules: passed.map((item) => item.name) };
}

async function auditTables() {
  assertSupabase();
  const checks = [];
  for (const table of [...new Set(tables)]) {
    const { error, count } = await withTimeout(
      supabase.from(table).select("*", { head: true, count: "exact" }).limit(1),
      `audit ${table}`,
      SUPABASE_CHECK_TIMEOUT_MS
    );
    checks.push({ table, ok: !error, count: error ? null : count, error: error?.message ?? null });
  }
  const failures = checks.filter((check) => !check.ok);
  if (failures.length) throw Object.assign(new Error(`${failures.length} table(s) indisponible(s)`), { detail: failures });
  return { total: checks.length, ok: checks.length };
}

async function verifyPermissions() {
  assertSupabase();
  const [profile, plans, rolePermissions, planModules] = await withTimeout(Promise.all([
    supabase.from("profiles").select("id,email,role,workspace_id").eq("role", "super_admin").limit(1).single(),
    supabase.from("subscription_plans").select("code,stripePriceId", { count: "exact" }).not("stripePriceId", "is", null),
    supabase.from("role_permissions").select("role_id", { count: "exact", head: true }),
    supabase.from("plan_modules").select("plan_code,module_key", { count: "exact" })
  ]), "verify permissions", SUPABASE_CHECK_TIMEOUT_MS);
  fail("profiles", profile.error);
  fail("subscription_plans", plans.error);
  fail("role_permissions", rolePermissions.error);
  fail("plan_modules", planModules.error);

  const priceIssues = (plans.data ?? []).filter((plan) => !String(plan.stripePriceId ?? "").startsWith("price_"));
  const moduleCoverage = new Set((planModules.data ?? []).map((row) => String(row.module_key)));
  const requiredModules = ["dashboard", "crm", "clients", "billing", "finance", "projects", "hr", "agenda", "marketing", "social", "ai", "documents", "support", "marketplace", "academy", "integrations", "security", "settings"];
  const missingModules = requiredModules.filter((module) => !moduleCoverage.has(module));

  if (profile.data.role !== "super_admin") throw new Error(`Aucun compte plateforme super_admin disponible (${profile.data.role}).`);
  if (priceIssues.length) throw Object.assign(new Error("Price IDs Stripe invalides dans subscription_plans"), { detail: priceIssues });
  if (missingModules.length) throw Object.assign(new Error("Modules absents de plan_modules"), { detail: missingModules });

  return {
    user: profile.data.email,
    role: profile.data.role,
    plans: plans.count,
    rolePermissions: rolePermissions.count,
    planModules: planModules.count
  };
}

async function runIntegrationRecipes() {
  const checks = [];
  const productionHealth = await getJson(`${target}/api/health`).catch(() => null);
  const productionIntegrations = productionHealth?.integrations ?? {};
  checks.push(await endpointCheck("Stripe billing", `${target}/api/stripe/health`, external, true));
  checks.push(await endpointCheck("Mistral AI", `${target}/api/mistral/health`, external));
  checks.push({ name: "SMS/WhatsApp", status: "passed", configured: false, disabled: true, note: "Fonctionnalites desactivees sans provider externe." });
  checks.push(await configCheck("Brevo email", ["BREVO_API_KEY"], { productionReady: productionIntegrations.email }));
  checks.push(await googleConfigCheck());
  checks.push(await configCheck("DocuSign OAuth", ["DOCUSIGN_INTEGRATION_KEY", "DOCUSIGN_CLIENT_SECRET"], { productionReady: productionIntegrations.signatures }));
  checks.push(await configCheck("Bridge banking", ["BRIDGE_CLIENT_ID", "BRIDGE_CLIENT_SECRET"], { productionReady: productionIntegrations.bridge }));

  if (sendEmail) checks.push(await sendBrevoEmail());

  const blocking = checks.filter((check) => check.status === "failed" && check.required);
  if (external && blocking.length) {
    throw Object.assign(new Error(`${blocking.length} integration(s) externe(s) en erreur`), {
      detail: { checks, blocking: blocking.map((check) => check.name) }
    });
  }
  return { checks, blocking: blocking.length };
}

async function endpointCheck(name, url, shouldCall, required = false) {
  if (!shouldCall) return { name, status: "skipped", required, reason: "Ajoute --external pour appeler le provider." };
  try {
    const data = await getJson(url);
    return { name, required, status: data.ready === false ? "partial" : "passed", data };
  } catch (error) {
    return { name, required, status: required ? "failed" : "partial", error: error.message };
  }
}

async function configCheck(name, keys, options = {}) {
  const configured = keys.every((key) => Boolean(env[key]));
  if (!configured && options.productionReady) {
    return {
      name,
      status: "passed",
      configured: true,
      source: "production",
      keys: Object.fromEntries(keys.map((key) => [key, false])),
      note: "Configure en production, absent de .env.local."
    };
  }
  const enabled = options.enabledValue ? env[keys[0]] === options.enabledValue : configured;
  return {
    name,
    status: configured && enabled ? "passed" : "partial",
    configured,
    keys: Object.fromEntries(keys.map((key) => [key, Boolean(env[key])])),
    note: configured && !enabled ? `Variable ${keys[0]} configuree mais pas activee.` : undefined
  };
}

async function googleConfigCheck() {
  const disabled = env.NEXT_PUBLIC_CENTRIX_DISABLE_GOOGLE_AUTH === "true";
  return {
    name: "Google Calendar",
    status: disabled ? "partial" : "passed",
    configured: !disabled,
    keys: {
      NEXT_PUBLIC_CENTRIX_DISABLE_GOOGLE_AUTH: Boolean(env.NEXT_PUBLIC_CENTRIX_DISABLE_GOOGLE_AUTH),
      NEXT_PUBLIC_GOOGLE_AUTH_ENABLED: Boolean(env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED)
    },
    note: disabled ? "Google OAuth est desactive par kill switch." : "Google OAuth est actif cote application."
  };
}

async function sendBrevoEmail() {
  const to = env.RECIPE_EMAIL_TO;
  if (!to) return { name: "Email reel", status: "skipped", reason: "Definis RECIPE_EMAIL_TO pour envoyer un test." };
  if (!env.BREVO_API_KEY) return { name: "Email reel", status: "failed", error: "BREVO_API_KEY manquante." };
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": env.BREVO_API_KEY, "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { email: "noreply@app-centrix.fr", name: "CENTRIX" },
      to: [{ email: to }],
      subject: "Recette production CENTRIX",
      textContent: `CENTRIX_OK ${marker}`
    })
  });
  const payload = await response.json().catch(() => ({}));
  return { name: "Email reel", provider: "brevo", status: response.ok ? "passed" : "failed", id: payload.messageId ?? null, error: response.ok ? null : payload.message ?? `HTTP ${response.status}` };
}

async function coreBusinessCrud({ workspaceId, userId }) {
  const client = await insert("clients", { workspace_id: workspaceId, name: `${marker} Client`, company: "CENTRIX Recette", email: `${marker.toLowerCase()}@example.com`, status: "active", created_by: userId, tags: ["recette"], notes: "recette" });
  await update("clients", client.id, { notes: "recette OK" });
  const prospect = await insert("prospects", { workspace_id: workspaceId, client_id: client.id, name: `${marker} Prospect`, company: "CENTRIX", email: `lead-${marker.toLowerCase()}@example.com`, stage: "new", score: 20, potential_amount: 12_000, source: "recette", created_by: userId, tags: ["recette"], metadata: { marker } });
  await update("prospects", prospect.id, { stage: "qualified", score: 80 });
  const quote = await insert("quotes", { workspace_id: workspaceId, client_id: client.id, prospect_id: prospect.id, number: `REC-Q-${Date.now()}`, title: "Devis recette", status: "draft", subtotal: 1_000, vat_rate: 20, vat_amount: 200, total: 1_200, currency: "EUR", valid_until: today, created_by: userId, line_items: [{ label: "Recette", qty: 1, price: 1_000 }], metadata: { marker } });
  await update("quotes", quote.id, { status: "accepted" });
  const invoice = await insert("invoices", { workspace_id: workspaceId, client_id: client.id, quote_id: quote.id, number: `REC-I-${Date.now()}`, title: "Facture recette", status: "pending", subtotal: 1_000, vat_rate: 20, vat_amount: 200, total: 1_200, currency: "EUR", due_at: today, created_by: userId, line_items: [{ label: "Recette", qty: 1, price: 1_000 }], metadata: { marker } });
  await update("invoices", invoice.id, { status: "paid", paid_amount: 1_200, paid_at: now });
  const project = await insert("projects", { workspace_id: workspaceId, client_id: client.id, name: `${marker} Projet`, title: `${marker} Projet`, description: "Projet recette", status: "active", priority: "high", progress: 10, budget: 5_000, starts_at: today, due_at: today, owner_id: userId, metadata: { marker } });
  const task = await insert("tasks", { workspace_id: workspaceId, project_id: project.id, client_id: client.id, title: `${marker} Tache`, description: "Tache recette", status: "todo", priority: "urgent", assignee_id: userId, due_at: later, created_by: userId, metadata: { marker } });
  await update("tasks", task.id, { status: "completed", completed_at: now });
  return { client: client.id, prospect: prospect.id, invoice: invoice.id, project: project.id, task: task.id };
}

async function crmCrud() {
  const lead = await insert("crm_leads", { id: rid("lead"), name: `${marker} lead`, company: "CENTRIX", email: `crm-${marker.toLowerCase()}@example.com`, phone: "+33100000003", status: "new", priority: "high", potentialAmount: 5_000, probability: 30, owner: "Administrateur", source: "recette", tags: ["recette"] });
  await update("crm_leads", lead.id, { status: "qualified", probability: 70 });
  const client = await insert("crm_clients", { id: rid("crm-client"), leadId: lead.id, name: "Client CRM", company: "CENTRIX", email: `crm-client-${marker.toLowerCase()}@example.com`, phone: "+33100000004", tags: ["recette"], lifetimeValue: 1_000, status: "active" });
  await insert("crm_notes", { id: rid("crm-note"), clientId: client.id, body: "Note recette" });
  return { lead: lead.id, client: client.id };
}

async function financeCrud({ workspaceId }) {
  const companyId = rid("fin");
  const catId = rid("cat");
  const bankId = rid("bank");
  const txId = rid("tx");
  await insert("financial_settings", { id: companyId, workspace_id: workspaceId, name: `${marker} Finance`, legalName: "CENTRIX SAS", vatNumber: "FRRECETTE", iban: "FR7612345678901234567890185", currency: "EUR", fiscalYearStart: today, vatRate: 20 });
  await insert("accounting_categories", { id: catId, label: `${marker} ventes`, account: "706", kind: "income" });
  await insert("bank_accounts", { id: bankId, workspace_id: workspaceId, companyId, bankName: "Banque Recette", label: "Compte recette", iban: "FR7612345678901234567890185", balance: 1_000 });
  await insert("transactions", { id: txId, workspace_id: workspaceId, companyId, bankAccountId: bankId, type: "revenue", status: "pending", date: today, label: `${marker} transaction`, counterparty: "Client recette", category: catId, amountExcludingTax: 100, vatRate: 20, vatAmount: 20, amountIncludingTax: 120 });
  await update("transactions", txId, { status: "validated" });
  await insert("revenues", { id: txId, workspace_id: workspaceId, companyId, bankAccountId: bankId, type: "revenue", status: "validated", date: today, label: `${marker} revenue`, counterparty: "Client recette", category: catId, amountExcludingTax: 100, vatRate: 20, vatAmount: 20, amountIncludingTax: 120 });
  return { companyId, bankId, txId };
}

async function hrCrud({ workspaceId }) {
  const employee = await insert("hr_employees", { id: rid("hr"), workspace_id: workspaceId, firstName: "Recette", lastName: "RH", email: `hr-${marker.toLowerCase()}@example.com`, phone: "+33100000002", role: "People Ops", department: "people", status: "onboarding", location: "Paris", manager: "Administrateur", startDate: today, avatarInitials: "RH" });
  await update("hr_employees", employee.id, { status: "active" });
  await insert("hr_contracts", { id: rid("contract"), workspace_id: workspaceId, employeeId: employee.id, type: "cdi", startDate: today, weeklyHours: 35, signed: true });
  return { employee: employee.id };
}

async function agendaCrud({ workspaceId }) {
  const calendar = await insert("calendars", { id: rid("cal"), workspace_id: workspaceId, name: `${marker} Agenda`, color: "#2563EB", owner: "admin@centrix.fr", sharedWith: ["team@centrix.fr"], permission: "company" });
  const event = await insert("calendar_events", { id: rid("event"), workspace_id: workspaceId, calendarId: calendar.id, title: `${marker} RDV`, description: "Recette agenda", type: "client_meeting", status: "pending", start: tomorrow, end: later, durationMinutes: 60, participants: ["admin@centrix.fr"], location: "Paris", videoUrl: "", color: "#2563EB" });
  await update("calendar_events", event.id, { status: "confirmed" });
  await insert("reservations", { id: rid("reservation"), workspace_id: workspaceId, eventId: event.id, type: "room", resourceName: "Salle recette", capacity: 4, start: tomorrow, end: later, status: "pending", approvalMode: "auto" });
  return { calendar: calendar.id, event: event.id };
}

async function marketingCrud({ workspaceId }) {
  const account = await insert("marketing_social_accounts", { id: rid("social"), workspace_id: workspaceId, network: "linkedin", handle: "centrix-recette", displayName: "CENTRIX Recette", followers: 100, engagementRate: 3, reach: 1_000, connected: true, color: "#2563EB" });
  const campaign = await insert("marketing_campaigns", { id: rid("campaign"), workspace_id: workspaceId, name: `${marker} campagne`, type: "social", objective: "Recette production", status: "active", budget: 500, spent: 20, revenue: 0, leads: 1, startsAt: today, endsAt: today, color: "#2563EB" });
  const post = await insert("marketing_posts", { id: rid("post"), workspace_id: workspaceId, campaignId: campaign.id, accountIds: [account.id], title: `${marker} post`, content: "Recette social media", status: "draft", scheduledAt: tomorrow, hashtags: ["centrix"], mentions: [], mediaUrls: [], category: "brand" });
  await update("marketing_posts", post.id, { status: "scheduled" });
  return { account: account.id, campaign: campaign.id, post: post.id };
}

async function supportCrud({ workspaceId, userId }) {
  const ticket = await insert("support_tickets", { workspace_id: workspaceId, created_by: userId, title: `${marker} ticket`, description: "Recette support", clientName: "Client recette", clientEmail: `support-${marker.toLowerCase()}@example.com`, priority: "high", category: "technical", categoryId: "cat-technical", status: "open", createdAt: now, updatedAt: now, metadata: { marker } });
  await update("support_tickets", ticket.id, { status: "resolved" });
  return { ticket: ticket.id };
}

async function documentsCrud({ workspaceId }) {
  const folder = await insert("folders", { id: rid("folder"), parentId: null, name: `${marker} dossier`, space: "company", color: "#2563EB" });
  const document = await insert("documents", { workspace_id: workspaceId, folderId: folder.id, name: `${marker}.pdf`, extension: "pdf", mimeType: "application/pdf", size: 1_200, category: "contract", storagePath: `recette/${marker}.pdf`, url: "https://app-centrix.fr/recette.pdf", favorite: false, shared: false, tags: ["recette"] });
  await update("documents", document.id, { favorite: true, signatureStatus: "pending" });
  return { folder: folder.id, document: document.id };
}

async function marketplaceCrud({ workspaceId }) {
  const category = await insert("service_categories", { id: rid("svc-cat"), slug: `recette-${Date.now()}`, name: `${marker} categorie`, color: "#2563EB" });
  const provider = await insert("providers", { id: rid("provider"), workspace_id: workspaceId, name: `${marker} prestataire`, companyName: "CENTRIX Services", email: `provider-${marker.toLowerCase()}@example.com`, verified: true, premium: false, level: "pro", availability: "available", skills: ["strategie"], rating: 5, completedOrders: 0, revenue: 0 });
  const service = await insert("marketplace_services", { id: rid("service"), workspace_id: workspaceId, providerId: provider.id, categoryId: category.id, title: `${marker} service`, description: "Recette marketplace", price: 300, deliveryDays: 7, status: "draft", mediaUrls: [], options: [] });
  await update("marketplace_services", service.id, { status: "published" });
  return { provider: provider.id, service: service.id };
}

async function academyCrud({ workspaceId }) {
  const course = await insert("courses", { id: rid("course"), workspace_id: workspaceId, title: `${marker} formation`, slug: `recette-${Date.now()}`, description: "Recette academy", category: "business", level: "beginner", status: "draft", price: 99, revenue: 0, students: 0, progressAverage: 0, thumbnailUrl: "" });
  await update("courses", course.id, { status: "published", publishedAt: now });
  const module = await insert("course_modules", { id: rid("module"), workspace_id: workspaceId, courseId: course.id, title: "Module recette", order: 1, published: true });
  const lesson = await insert("lessons", { id: rid("lesson"), workspace_id: workspaceId, moduleId: module.id, title: "Lecon recette", type: "video", content: "Recette", videoUrl: "", durationMinutes: 10, order: 1, preview: false });
  return { course: course.id, lesson: lesson.id };
}

async function aiWorkflowsCrud({ workspaceId, userId }) {
  const workflow = await insert("workflows", { workspace_id: workspaceId, name: `${marker} workflow`, description: "Recette workflow", status: "draft", trigger_type: "manual", steps: [], created_by: userId, metadata: { module: "workflows", marker } });
  await update("workflows", workflow.id, { status: "active" });
  const conversation = await insert("ai_conversations", { id: rid("conv"), workspace_id: workspaceId, title: `${marker} conversation`, model: "mistral-large-latest", tokensUsed: 0 });
  await insert("ai_messages", { id: rid("msg"), workspace_id: workspaceId, conversationId: conversation.id, role: "user", content: "Recette IA", tokens: 2 });
  return { workflow: workflow.id, conversation: conversation.id };
}

async function integrationsCrud({ workspaceId }) {
  const integration = await insert("integrations", { id: rid("integration"), workspace_id: workspaceId, name: `${marker} integration`, provider: "zapier", category: "automation", description: "Recette integration", status: "disconnected", syncEnabled: false });
  await update("integrations", integration.id, { status: "connected", syncEnabled: true });
  const webhook = await insert("webhooks", { id: rid("webhook"), workspace_id: workspaceId, name: `${marker} webhook`, url: "https://app-centrix.fr/api/webhook/recette", events: ["invoice.paid"], secretPreview: "rec_***", active: true, retryEnabled: true });
  return { integration: integration.id, webhook: webhook.id };
}

async function securityCrud({ workspaceId }) {
  const alert = await insert("security_alerts", { id: rid("sec"), workspace_id: workspaceId, title: `${marker} alerte`, description: "Recette securite", severity: "medium", status: "open", source: "api", assignedTo: "Administrateur" });
  await update("security_alerts", alert.id, { status: "resolved" });
  await insert("audit_logs", { id: rid("audit"), workspace_id: workspaceId, actor: "Administrateur", action: "recette.production", target: "CENTRIX", module: "security", before: "-", after: "OK" });
  return { alert: alert.id };
}

async function notificationsCrud({ workspaceId, userId }) {
  const notification = await insert("notifications", { workspace_id: workspaceId, user_id: userId, title: `${marker} notification`, body: "Recette notification", type: "info", module: "dashboard", metadata: { marker } });
  await update("notifications", notification.id, { read_at: now });
  const message = await insert("messages", { workspace_id: workspaceId, sender_id: userId, body: `${marker} message collaboration`, channel: "general", metadata: { marker } });
  await update("messages", message.id, { body: `${marker} message collaboration OK` });
  return { notification: notification.id, message: message.id };
}

async function legalCrud({ workspaceId }) {
  const form = await insert("legal_forms", { id: rid("form"), code: "SAS", name: "SAS recette", description: "Forme recette", liability: "Limitee", socialRegime: "Assimile salarie", taxRegime: "IS", minCapital: 1, bestFor: ["startup"], complexity: "standard" });
  const company = await insert("companies", { id: rid("company"), workspace_id: workspaceId, name: `${marker} societe`, legalFormId: form.id, status: "draft", activity: "Conseil", city: "Paris", capitalAmount: 1_000, capitalDeposited: 0, progress: 10 });
  await update("companies", company.id, { status: "in_review", progress: 40 });
  await insert("legal_documents", { id: rid("legal-doc"), workspace_id: workspaceId, companyId: company.id, title: "Statuts recette", type: "statuts", status: "draft", url: "https://app-centrix.fr/legal-recette.pdf" });
  return { company: company.id };
}

async function operationalCrud({ workspaceId }) {
  const modules = ["alerts", "activities", "prospects", "quotes", "treasury", "contracts", "business-plan", "funding", "compliance", "formalities", "recruitment", "salaries", "leave", "expenses", "time", "tasks", "gantt", "collaboration", "messaging", "emailing", "sms", "advertising", "content-generation", "financial-analysis", "document-generator", "data-chat", "sav", "faq", "experts", "trainers", "consultants", "resources", "connections", "audit", "access", "permissions", "users", "roles"];
  for (const module_key of modules) {
    const row = await insert("module_records", { workspace_id: workspaceId, module_key, title: `${marker} ${module_key}`, description: "Recette sous-module", record_type: "Recette", status: "active", priority: "medium", amount: 1, owner_name: "Administrateur", due_at: today, tags: ["recette"], metadata: { marker } });
    await update("module_records", row.id, { status: "completed" });
  }
  return { modules: modules.length };
}

async function getContext() {
  const { data, error } = await withTimeout(
    supabase.from("profiles").select("id,email,role,workspace_id").limit(1).single(),
    "load recipe context",
    SUPABASE_CHECK_TIMEOUT_MS
  );
  fail("profiles", error);
  if (!data.workspace_id) throw new Error("Profil sans workspace_id.");
  return { userId: data.id, email: data.email, role: data.role, workspaceId: data.workspace_id };
}

async function insert(table, row) {
  const { data, error } = await withTimeout(
    supabase.from(table).insert(row).select("*").single(),
    `insert ${table}`,
    SUPABASE_CHECK_TIMEOUT_MS
  );
  fail(`insert ${table}`, error);
  cleanup.push(async () => {
    if (data?.id) await supabase.from(table).delete().eq("id", data.id);
  });
  return data;
}

async function update(table, id, patch) {
  const { data, error } = await withTimeout(
    supabase.from(table).update(patch).eq("id", id).select("*").single(),
    `update ${table}`,
    SUPABASE_CHECK_TIMEOUT_MS
  );
  fail(`update ${table}`, error);
  return data;
}

async function cleanupRows() {
  for (const fn of cleanup.reverse()) {
    try {
      await fn();
    } catch {
      // Cleanup must not hide the actual recipe result.
    }
  }
}

async function recipe(name, fn, required = false) {
  const startedAt = Date.now();
  try {
    const detail = await withTimeout(fn(), name, RECIPE_STEP_TIMEOUT_MS);
    results.push({ name, status: "passed", durationMs: Date.now() - startedAt, detail });
  } catch (error) {
    results.push({
      name,
      status: required ? "failed" : "partial",
      durationMs: Date.now() - startedAt,
      error: error.message,
      detail: error.detail ?? null
    });
  }
}

async function getJson(url) {
  const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(HTTP_CHECK_TIMEOUT_MS) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(`${url} HTTP ${response.status}`), { detail: data });
  return data;
}

async function withTimeout(promise, label, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timeout apres ${timeoutMs}ms`)), timeoutMs);
    })
  ]);
}

function loadEnv() {
  const parsed = { ...process.env };
  if (!fs.existsSync(".env.local")) return parsed;
  const lines = fs.readFileSync(".env.local", "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    parsed[key] = process.env[key] ?? value;
  }
  return parsed;
}

function assertSupabase() {
  if (!supabase) throw new Error("NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.");
}

function fail(label, error) {
  if (error) throw new Error(`${label}: ${error.code ?? ""} ${error.message ?? error}`);
}

function rid(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function maskUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.hostname}`;
  } catch {
    return "configured";
  }
}

function printReport() {
  const report = {
    marker,
    target,
    passed: results.filter((item) => item.status === "passed").length,
    partial: results.filter((item) => item.status === "partial").length,
    failed: results.filter((item) => item.status === "failed").length,
    results
  };

  if (json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`\nCENTRIX production recipes - ${marker}`);
  console.log(`Target: ${target}`);
  console.log(`Passed: ${report.passed} | Partial: ${report.partial} | Failed: ${report.failed}\n`);
  for (const item of results) {
    const icon = item.status === "passed" ? "OK" : item.status === "partial" ? "PARTIAL" : "FAILED";
    console.log(`[${icon}] ${item.name} (${item.durationMs}ms)`);
    if (item.error) console.log(`  ${item.error}`);
    if (item.detail && item.status !== "passed") console.log(`  ${JSON.stringify(item.detail)}`);
  }
}
