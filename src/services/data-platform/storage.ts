import { getSupabaseClient } from "@/lib/supabase";
import { resolveWorkspaceContext } from "@/services/data-platform/workspace";

export type UploadDocumentOptions = {
  bucket?: "centrix-cloud" | "centrix-avatars";
  folder?: string;
  clientId?: string;
  projectId?: string;
  category?: string;
};

function sanitizeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export async function uploadCentrixFile(file: File, options: UploadDocumentOptions = {}) {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: "Supabase non configure." };

  const workspace = await resolveWorkspaceContext(supabase);
  if (!workspace) return { data: null, error: "Workspace introuvable." };

  const bucket = options.bucket ?? "centrix-cloud";
  const folder = options.folder ?? "documents";
  const filePath = `${workspace.workspaceId}/${folder}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;

  const upload = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: "3600",
    upsert: false
  });

  if (upload.error) return { data: null, error: upload.error.message };

  if (bucket === "centrix-cloud") {
    const document = await supabase
      .from("documents")
      .insert({
        bucket,
        category: options.category ?? "general",
        client_id: options.clientId,
        mime_type: file.type,
        name: file.name,
        owner_id: workspace.userId,
        path: filePath,
        project_id: options.projectId,
        size_bytes: file.size,
        workspace_id: workspace.workspaceId
      })
      .select("*")
      .single();

    if (document.error) return { data: null, error: document.error.message };
    return { data: document.data, error: null };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return { data: { path: filePath, publicUrl: data.publicUrl }, error: null };
}

export async function createSignedDocumentUrl(path: string, expiresIn = 60 * 10) {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: null, error: "Supabase non configure." };

  const { data, error } = await supabase.storage.from("centrix-cloud").createSignedUrl(path, expiresIn);
  return { data, error: error?.message ?? null };
}
