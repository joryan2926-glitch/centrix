import { getSupabaseClient } from "@/lib/supabase";
import type { CentrixModuleKey, EventSeverity, ModuleConnection, ModuleEvent, ModuleTask, TaskPriority } from "@/types/saas-core";

type CreateEventInput = {
  module: CentrixModuleKey;
  entityType: string;
  entityId?: string | null;
  title: string;
  detail?: string;
  severity?: EventSeverity;
  metadata?: Record<string, unknown>;
};

type CreateTaskInput = {
  module: CentrixModuleKey;
  title: string;
  assignee?: string;
  priority?: TaskPriority;
  dueAt?: string | null;
  sourceEntityType?: string;
  sourceEntityId?: string;
};

export async function createModuleEvent(input: CreateEventInput): Promise<ModuleEvent> {
  const event: ModuleEvent = {
    id: `event-${Date.now()}`,
    module: input.module,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    title: input.title,
    detail: input.detail ?? "",
    severity: input.severity ?? "info",
    status: "open",
    createdAt: new Date().toISOString()
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    await supabase.from("module_events").insert({
      id: event.id,
      module: event.module,
      entity_type: event.entityType,
      entity_id: event.entityId,
      title: event.title,
      detail: event.detail,
      severity: event.severity,
      status: event.status,
      metadata: input.metadata ?? {},
      created_at: event.createdAt
    });
  }

  return event;
}

export async function createLinkedTask(input: CreateTaskInput): Promise<ModuleTask> {
  const task: ModuleTask = {
    id: `task-${Date.now()}`,
    module: input.module,
    title: input.title,
    assignee: input.assignee ?? "Equipe",
    priority: input.priority ?? "medium",
    status: "todo",
    dueAt: input.dueAt ?? null
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    await supabase.from("module_tasks").insert({
      id: task.id,
      module: task.module,
      title: task.title,
      assignee: task.assignee,
      priority: task.priority,
      status: task.status,
      due_at: task.dueAt,
      source_entity_type: input.sourceEntityType,
      source_entity_id: input.sourceEntityId
    });
  }

  return task;
}

export async function createModuleConnection(input: Omit<ModuleConnection, "id">): Promise<ModuleConnection> {
  const connection: ModuleConnection = {
    id: `conn-${Date.now()}`,
    ...input
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    await supabase.from("module_connections").insert({
      id: connection.id,
      source_module: connection.sourceModule,
      target_module: connection.targetModule,
      trigger: connection.trigger,
      action: connection.action,
      active: connection.active
    });
  }

  return connection;
}

export async function uploadCentrixFile(file: File, path: string, module: CentrixModuleKey = "documents") {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, path, error: "Supabase Storage non configure." };
  }

  const { error } = await supabase.storage.from("centrix-cloud").upload(path, file, { upsert: true });
  if (error) return { ok: false, path, error: error.message };

  await createModuleEvent({
    module,
    entityType: "file",
    entityId: path,
    title: "Fichier cloud synchronise",
    detail: `${file.name} est disponible dans CENTRIX Cloud.`,
    severity: "success"
  });

  return { ok: true, path, error: null };
}
