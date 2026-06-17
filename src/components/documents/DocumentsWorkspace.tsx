"use client";

import { Archive, Download, Eye, File, FileImage, FileSignature, FileText, Folder, FolderPlus, Grid2X2, HardDrive, History, Image as ImageIcon, Link2, List, Loader2, MessageSquare, MoreHorizontal, Search, Share2, ShieldCheck, Star, Tags, Trash2, UploadCloud } from "lucide-react";
import Image from "next/image";
import type { DragEvent } from "react";
import { useMemo, useState } from "react";
import { formatBytes, formatDocumentDate, formatStoragePercent } from "@/lib/documents/format";
import { downloadTextFile } from "@/lib/download";
import { categoryLabels, createDocumentNotification, createFolder, createShare, documentTone, duplicateDocument, filterDocuments, getDocumentsDashboard } from "@/services/documents/calculations";
import { useDocumentsData } from "@/hooks/documents/useDocumentsData";
import type { CloudDocument, DocumentCategory } from "@/types/documents";
import { DocumentKpiCard } from "@/ui/documents/DocumentKpiCard";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import { EmptyState } from "@/ui/EmptyState";
import { Modal } from "@/ui/Modal";
import { Skeleton } from "@/ui/Skeleton";
import { Toast } from "@/ui/Toast";

const views = [
  { id: "grid", label: "Grille", icon: Grid2X2 },
  { id: "list", label: "Liste", icon: List },
  { id: "signatures", label: "Signatures", icon: FileSignature },
  { id: "activity", label: "Activite", icon: History }
] as const;

type View = (typeof views)[number]["id"];

export function DocumentsWorkspace() {
  const { data, loading, mode, toast, uploadProgress, mutate, removeDocumentAsset, uploadFiles, sync, notify } = useDocumentsData();
  const [view, setView] = useState<View>("grid");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<DocumentCategory | "all">("all");
  const [folderId, setFolderId] = useState<string | "all">("all");
  const [selectedDocumentId, setSelectedDocumentId] = useState(data.documents[0]?.id ?? "");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [newFolderName, setNewFolderName] = useState("Nouveau dossier");

  const dashboard = useMemo(() => getDocumentsDashboard(data), [data]);
  const documents = useMemo(() => filterDocuments(data.documents, query, category, folderId), [data.documents, query, category, folderId]);
  const selectedDocument = data.documents.find((document) => document.id === selectedDocumentId) ?? data.documents[0] ?? null;
  const usagePercent = formatStoragePercent(dashboard.used, dashboard.limit);
  const comments = data.comments.filter((comment) => comment.documentId === selectedDocument?.id);
  const shares = data.shares.filter((share) => share.documentId === selectedDocument?.id);
  const versions = data.versions.filter((version) => version.documentId === selectedDocument?.id);

  async function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    await uploadFiles(Array.from(event.dataTransfer.files), folderId === "all" ? null : folderId);
  }

  function handleInputUpload(files: FileList | null) {
    if (!files) return;
    uploadFiles(Array.from(files), folderId === "all" ? null : folderId);
  }

  function addFolder() {
    const folder = createFolder(newFolderName);
    mutate(
      (current) => ({ ...current, folders: [folder, ...current.folders], notifications: [createDocumentNotification(null, "Dossier cree", `${folder.name} est pret.`, "success"), ...current.notifications] }),
      { title: "Dossier cree", detail: `${folder.name} est ajoute au cloud.` }
    );
    setNewFolderName("Nouveau dossier");
  }

  function toggleFavorite(documentId: string) {
    mutate((current) => ({
      ...current,
      documents: current.documents.map((document) => (document.id === documentId ? { ...document, favorite: !document.favorite, updatedAt: new Date().toISOString() } : document))
    }));
  }

  function duplicate(document: CloudDocument) {
    const copy = duplicateDocument(document);
    mutate(
      (current) => ({ ...current, documents: [copy, ...current.documents], notifications: [createDocumentNotification(copy.id, "Document duplique", `${copy.name} est cree.`, "success"), ...current.notifications] }),
      { title: "Document duplique", detail: copy.name }
    );
  }

  async function removeDocument(documentId: string) {
    const document = data.documents.find((item) => item.id === documentId);
    if (!document || !window.confirm("Supprimer ce document du cloud ?")) return;
    await removeDocumentAsset(document);
    mutate(
      (current) => ({
        ...current,
        documents: current.documents.filter((document) => document.id !== documentId),
        shares: current.shares.filter((share) => share.documentId !== documentId),
        comments: current.comments.filter((comment) => comment.documentId !== documentId),
        versions: current.versions.filter((version) => version.documentId !== documentId)
      }),
      { title: "Document supprime", detail: "Le fichier est retire de l'espace courant." }
    );
  }

  function downloadDocument(document: CloudDocument) {
    if (document.url) {
      window.open(document.url, "_blank", "noopener,noreferrer");
    } else {
      downloadTextFile(document.name, `Document CENTRIX\nNom: ${document.name}\nCategorie: ${document.category}\nTaille: ${formatBytes(document.size)}\nStorage: ${document.storagePath ?? "local"}`);
    }
    mutate((current) => ({
      ...current,
      documents: current.documents.map((item) => item.id === document.id ? { ...item, downloads: item.downloads + 1, updatedAt: new Date().toISOString() } : item)
    }));
  }

  function addComment(documentId: string) {
    const content = window.prompt("Commentaire document");
    if (!content) return;
    mutate((current) => ({
      ...current,
      comments: [{ author: "CENTRIX", content, createdAt: new Date().toISOString(), documentId, id: `comment-${crypto.randomUUID()}` }, ...current.comments],
      notifications: [createDocumentNotification(documentId, "Commentaire ajoute", content, "info"), ...current.notifications]
    }), { title: "Commentaire ajoute", detail: "La discussion document est mise a jour." });
  }

  function addTag(documentId: string) {
    const tag = window.prompt("Tag a ajouter");
    if (!tag) return;
    mutate((current) => ({
      ...current,
      documents: current.documents.map((document) => document.id === documentId ? { ...document, tags: Array.from(new Set([...document.tags, tag])), updatedAt: new Date().toISOString() } : document)
    }), { title: "Tag ajoute", detail: tag });
  }

  function shareDocument(documentId: string) {
    const share = createShare(documentId, "collaborateur@centrix.local", "read");
    mutate(
      (current) => ({
        ...current,
        documents: current.documents.map((document) => (document.id === documentId ? { ...document, shared: true, updatedAt: new Date().toISOString() } : document)),
        shares: [share, ...current.shares],
        notifications: [createDocumentNotification(documentId, "Lien securise cree", "Le document est partage en lecture.", "success"), ...current.notifications]
      }),
      { title: "Partage active", detail: "Lien securise cree avec permission lecture." }
    );
  }

  function renameDocument(documentId: string) {
    const nextName = window.prompt("Nouveau nom du document");
    if (!nextName) return;
    mutate(
      (current) => ({
        ...current,
        documents: current.documents.map((document) => (document.id === documentId ? { ...document, name: nextName, updatedAt: new Date().toISOString() } : document))
      }),
      { title: "Document renomme", detail: nextName }
    );
  }

  async function sendForSignature(documentId: string) {
    const signerEmail = window.prompt("Email du signataire");
    if (!signerEmail) return;
    const signerName = window.prompt("Nom du signataire");
    if (!signerName) return;

    notify("Signature electronique", "Creation de l'enveloppe DocuSign...");
    const response = await fetch("/api/integrations/signatures/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId, signerEmail, signerName })
    });
    const payload = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) {
      notify("Signature non envoyee", payload.error ?? "DocuSign est indisponible.");
      return;
    }
    mutate(
      (current) => ({ ...current, documents: current.documents.map((document) => document.id === documentId ? { ...document, signatureStatus: "pending" } : document) }),
      { title: "Signature envoyee", detail: `Une demande a ete envoyee a ${signerEmail}.` }
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
        <Skeleton className="h-36" />
        <section className="grid gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-28" />)}
        </section>
        <Skeleton className="h-[560px]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      {toast ? <Toast {...toast} /> : null}

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge tone="cyan">Cloud documentaire</Badge>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Documents & Cloud</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Espace documentaire securise avec upload, dossiers, partage, commentaires, versions, signature future, OCR prepare et Supabase Storage.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[8px] bg-white px-4 text-sm font-semibold text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-300 hover:bg-cyan-100">
              <UploadCloud size={17} /> Upload
              <input className="hidden" multiple type="file" onChange={(event) => handleInputUpload(event.target.files)} />
            </label>
            <Button onClick={() => { window.location.href = "/api/integrations/docusign/connect?returnTo=/documents"; }} variant="ghost">
              <FileSignature size={17} /> Connecter DocuSign
            </Button>
            <Button onClick={sync}><ShieldCheck size={17} /> Sync {mode}</Button>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <DocumentKpiCard delta="total" icon={<FileText size={19} />} label="Documents" value={String(dashboard.documents)} />
        <DocumentKpiCard delta={`${usagePercent}%`} icon={<HardDrive size={19} />} label="Stockage utilise" tone="violet" value={formatBytes(dashboard.used)} />
        <DocumentKpiCard delta="7 jours" icon={<History size={19} />} label="Recents" tone="emerald" value={String(dashboard.recent)} />
        <DocumentKpiCard delta="liens" icon={<Share2 size={19} />} label="Partages" value={String(dashboard.shared)} />
        <DocumentKpiCard delta="downloads" icon={<Download size={19} />} label="Telechargements" tone="emerald" value={String(dashboard.downloads)} />
        <DocumentKpiCard delta="realtime" icon={<MessageSquare size={19} />} label="Activite" value={String(dashboard.activity)} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[280px_1fr_340px]">
        <Card className="p-4">
          <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Stockage entreprise</span>
              <span className="font-medium text-white">{usagePercent}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-electric via-violet to-fuchsia-400" style={{ width: `${usagePercent}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">{formatBytes(dashboard.used)} / {formatBytes(dashboard.limit)}</p>
          </div>

          <div className="mt-4 flex gap-2">
            <input className="h-10 min-w-0 flex-1 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-sm text-white outline-none" value={newFolderName} onChange={(event) => setNewFolderName(event.target.value)} />
            <Button className="h-10 w-10 px-0" onClick={addFolder}><FolderPlus size={17} /></Button>
          </div>

          <div className="mt-4 space-y-2">
            <button className={`flex w-full items-center gap-3 rounded-[8px] px-3 py-2 text-left text-sm transition-all ${folderId === "all" ? "bg-white/12 text-white" : "text-slate-400 hover:bg-white/8 hover:text-white"}`} onClick={() => setFolderId("all")}>
              <Folder size={17} /> Tous les fichiers
            </button>
            {data.folders.map((folder) => (
              <button key={folder.id} className={`flex w-full items-center gap-3 rounded-[8px] px-3 py-2 text-left text-sm transition-all ${folderId === folder.id ? "bg-white/12 text-white" : "text-slate-400 hover:bg-white/8 hover:text-white"}`} onClick={() => setFolderId(folder.id)}>
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: folder.color }} />
                <span className="truncate">{folder.name}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Categories</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["all", "contract", "invoice", "quote", "hr", "legal", "accounting", "image", "archive"] as const).map((item) => (
                <button key={item} className={`rounded-[8px] px-2.5 py-1 text-xs transition-all ${category === item ? "bg-cyan-300/15 text-cyan-100" : "bg-white/[0.05] text-slate-400 hover:text-white"}`} onClick={() => setCategory(item)}>
                  {item === "all" ? "Tous" : categoryLabels[item]}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card
          className={`min-h-[650px] p-4 transition-all duration-300 ${dragActive ? "border-cyan-200/40 bg-cyan-300/10" : ""}`}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDrop={handleDrop}
        >
          <div className="flex flex-col gap-3 border-b border-white/10 pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex h-10 flex-1 items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.055] px-3 text-sm text-slate-400">
              <Search size={16} />
              <input className="w-full bg-transparent outline-none placeholder:text-slate-500" placeholder="Recherche globale, OCR, tags..." value={query} onChange={(event) => setQuery(event.target.value)} />
            </div>
            <div className="flex gap-1 rounded-[8px] border border-white/10 bg-white/[0.04] p-1">
              {views.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.id} className={`flex h-9 items-center gap-2 rounded-[8px] px-3 text-xs transition-all ${view === item.id ? "bg-white/12 text-white" : "text-slate-400 hover:text-white"}`} onClick={() => setView(item.id)}>
                    <Icon size={15} /> {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {uploadProgress ? (
            <div className="mt-4 rounded-[8px] border border-cyan-200/20 bg-cyan-300/10 p-3">
              <div className="flex items-center gap-2 text-sm text-cyan-100"><Loader2 className="animate-spin" size={16} /> Upload en cours {uploadProgress}%</div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-300" style={{ width: `${uploadProgress}%` }} /></div>
            </div>
          ) : null}

          {view === "grid" ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
              {documents.map((document) => (
                <DocumentCard key={document.id} document={document} onDownload={downloadDocument} onDuplicate={duplicate} onFavorite={toggleFavorite} onPreview={() => { setSelectedDocumentId(document.id); setPreviewOpen(true); }} onRemove={removeDocument} onRename={renameDocument} onSelect={() => setSelectedDocumentId(document.id)} onShare={shareDocument} selected={selectedDocument?.id === document.id} />
              ))}
            </div>
          ) : null}

          {view === "list" ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  <tr><th className="pb-3">Nom</th><th className="pb-3">Categorie</th><th className="pb-3">Taille</th><th className="pb-3">Signature</th><th className="pb-3">MAJ</th><th className="pb-3" /></tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {documents.map((document) => (
                    <tr key={document.id} className="text-slate-300">
                      <td className="py-3 text-white">{document.name}</td>
                      <td className="py-3"><Badge tone={documentTone(document)}>{categoryLabels[document.category]}</Badge></td>
                      <td className="py-3">{formatBytes(document.size)}</td>
                      <td className="py-3">{document.signatureStatus}</td>
                      <td className="py-3 text-slate-500">{formatDocumentDate(document.updatedAt)}</td>
                      <td className="py-3 text-right"><Button className="h-9 px-3" onClick={() => { setSelectedDocumentId(document.id); setPreviewOpen(true); }} variant="ghost"><Eye size={15} /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {view === "signatures" ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {data.documents.filter((document) => document.signatureStatus !== "none").map((document) => (
                <div key={document.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{document.name}</p>
                    <Badge tone={document.signatureStatus === "signed" ? "emerald" : document.signatureStatus === "rejected" ? "rose" : "cyan"}>{document.signatureStatus}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">Workflow de signature electronique DocuSign securise.</p>
                  <Button className="mt-4" onClick={() => sendForSignature(document.id)}><FileSignature size={16} /> Envoyer a signer</Button>
                </div>
              ))}
            </div>
          ) : null}

          {view === "activity" ? (
            <div className="mt-4 space-y-3">
              {data.notifications.map((notification) => (
                <div key={notification.id} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">{notification.title}</p>
                    <Badge tone={notification.severity === "warning" ? "rose" : notification.severity === "success" ? "emerald" : "cyan"}>{notification.severity}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{notification.detail}</p>
                </div>
              ))}
            </div>
          ) : null}

          {!documents.length && view !== "activity" ? <div className="mt-4"><EmptyState icon={<UploadCloud size={20} />} title="Aucun document" detail="Glissez des fichiers ici ou utilisez le bouton Upload." /></div> : null}
        </Card>

        <Card className="p-4">
          {selectedDocument ? (
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">Preview document</p>
                  <h2 className="mt-1 text-lg font-semibold text-white">{selectedDocument.name}</h2>
                </div>
                <Badge tone={documentTone(selectedDocument)}>{categoryLabels[selectedDocument.category]}</Badge>
              </div>
              <PreviewBox document={selectedDocument} />
              <div className="mt-4 grid gap-2">
                <Button className="w-full" onClick={() => sendForSignature(selectedDocument.id)} variant="primary">
                  <FileSignature size={16} /> Envoyer a signer
                </Button>
                <div className="grid grid-cols-3 gap-2">
                  <Button className="h-9 px-2" onClick={() => downloadDocument(selectedDocument)} variant="ghost"><Download size={15} /> Telecharger</Button>
                  <Button className="h-9 px-2" onClick={() => addComment(selectedDocument.id)} variant="ghost"><MessageSquare size={15} /> Commenter</Button>
                  <Button className="h-9 px-2" onClick={() => addTag(selectedDocument.id)} variant="ghost"><Tags size={15} /> Tag</Button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Metric label="Taille" value={formatBytes(selectedDocument.size)} />
                <Metric label="OCR" value={selectedDocument.ocrStatus} />
                <Metric label="Versions" value={String(versions.length)} />
                <Metric label="Partages" value={String(shares.length)} />
              </div>
              <div className="mt-4 space-y-3">
                <Panel title="Commentaires">
                  {comments.length ? comments.map((comment) => <p key={comment.id} className="text-xs leading-5 text-slate-400">{comment.author}: {comment.content}</p>) : <p className="text-xs text-slate-500">Aucun commentaire.</p>}
                </Panel>
                <Panel title="Liens securises">
                  {shares.length ? shares.map((share) => <p key={share.id} className="text-xs leading-5 text-slate-400">{share.email} - {share.permission}</p>) : <p className="text-xs text-slate-500">Non partage.</p>}
                </Panel>
                <Panel title="Tags">
                  <div className="flex flex-wrap gap-2">{selectedDocument.tags.map((tag) => <span key={tag} className="rounded-[8px] bg-white/[0.06] px-2 py-1 text-xs text-slate-300">{tag}</span>)}</div>
                </Panel>
              </div>
            </div>
          ) : (
            <EmptyState icon={<FileText size={20} />} title="Aucun fichier selectionne" detail="Selectionnez un document pour voir son apercu." />
          )}
        </Card>
      </section>

      <Modal open={previewOpen} title={selectedDocument?.name ?? "Preview"} onClose={() => setPreviewOpen(false)}>
        {selectedDocument ? <PreviewBox document={selectedDocument} large /> : null}
      </Modal>
    </div>
  );
}

function DocumentCard({ document, selected, onSelect, onPreview, onDownload, onFavorite, onShare, onDuplicate, onRename, onRemove }: {
  document: CloudDocument;
  selected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onDownload: (document: CloudDocument) => void;
  onFavorite: (id: string) => void;
  onShare: (id: string) => void;
  onDuplicate: (document: CloudDocument) => void;
  onRename: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const Icon = document.category === "image" ? FileImage : document.category === "archive" ? Archive : FileText;
  return (
    <div className={`rounded-[8px] border p-4 transition-all duration-200 hover:-translate-y-1 hover:bg-white/[0.08] ${selected ? "border-cyan-200/35 bg-cyan-300/10" : "border-white/10 bg-white/[0.04]"}`} onClick={onSelect}>
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-[8px] bg-white/[0.08] text-cyan-100"><Icon size={22} /></div>
        <button className="text-slate-400 hover:text-white" onClick={(event) => { event.stopPropagation(); onFavorite(document.id); }}><Star size={17} fill={document.favorite ? "currentColor" : "none"} /></button>
      </div>
      <p className="mt-4 line-clamp-2 text-sm font-semibold text-white">{document.name}</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <Badge tone={documentTone(document)}>{categoryLabels[document.category]}</Badge>
        <span className="text-xs text-slate-500">{formatBytes(document.size)}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button className="h-9 px-3" onClick={(event) => { event.stopPropagation(); onPreview(); }} variant="ghost"><Eye size={15} /></Button>
        <Button className="h-9 px-3" onClick={(event) => { event.stopPropagation(); onDownload(document); }} variant="ghost"><Download size={15} /></Button>
        <Button className="h-9 px-3" onClick={(event) => { event.stopPropagation(); onShare(document.id); }} variant="ghost"><Link2 size={15} /></Button>
        <Button className="h-9 px-3" onClick={(event) => { event.stopPropagation(); onDuplicate(document); }} variant="ghost"><File size={15} /></Button>
        <Button className="h-9 px-3" onClick={(event) => { event.stopPropagation(); onRename(document.id); }} variant="ghost"><MoreHorizontal size={15} /></Button>
        <Button className="h-9 px-3 text-rose-200" onClick={(event) => { event.stopPropagation(); onRemove(document.id); }} variant="ghost"><Trash2 size={15} /></Button>
      </div>
    </div>
  );
}

function PreviewBox({ document, large = false }: { document: CloudDocument; large?: boolean }) {
  const isImage = ["png", "jpg", "jpeg"].includes(document.extension);
  const isPdf = document.extension === "pdf";
  return (
    <div className={`mt-4 grid place-items-center rounded-[8px] border border-white/10 bg-white/[0.04] ${large ? "min-h-[460px]" : "min-h-52"} p-5`}>
      {isImage && document.url ? <Image alt={document.name} className="max-h-[420px] rounded-[8px] object-contain" height={420} src={document.url} width={640} /> : null}
      {isPdf ? <div className="text-center"><FileText className="mx-auto text-cyan-100" size={large ? 64 : 42} /><p className="mt-3 text-sm text-slate-300">Apercu PDF pret</p><p className="mt-1 text-xs text-slate-500">Integration viewer PDF future</p></div> : null}
      {!isImage && !isPdf ? <div className="text-center"><ImageIcon className="mx-auto text-violet-100" size={large ? 64 : 42} /><p className="mt-3 text-sm text-slate-300">Preview metadata</p><p className="mt-1 text-xs text-slate-500">{document.mimeType}</p></div> : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-3">
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-white"><Tags size={14} /> {title}</p>
      {children}
    </div>
  );
}
