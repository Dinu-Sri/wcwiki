"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  size: number | null;
  format: string | null;
  subfolder: string | null;
  createdAt: string;
  uploadedBy: { id: string; name: string | null; email?: string | null };
}

interface MediaDetail extends MediaItem {
  usage: { type: string; id: string; title: string }[];
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Detail panel state
  const [selected, setSelected] = useState<MediaDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editAlt, setEditAlt] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "24" });
    if (search.trim()) params.set("search", search.trim());
    try {
      const res = await fetch(`/api/media?${params}`);
      const data = await res.json();
      setItems(data.items || []);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch {
      // silently fail
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setConfirmDelete(false);
    try {
      const res = await fetch(`/api/media/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelected(data);
        setEditAlt(data.alt || "");
      }
    } catch {
      // silently fail
    }
    setDetailLoading(false);
  };

  const handleSaveAlt = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/media/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt: editAlt }),
      });
      if (res.ok) {
        setSelected({ ...selected, alt: editAlt });
        setItems((prev) =>
          prev.map((i) => (i.id === selected.id ? { ...i, alt: editAlt } : i))
        );
      }
    } catch {
      // silently fail
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/media/${selected.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== selected.id));
        setTotal((t) => t - 1);
        setSelected(null);
      }
    } catch {
      // silently fail
    }
    setDeleting(false);
    setConfirmDelete(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("subfolder", "general");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        setPage(1);
        await fetchMedia();
      }
    } catch {
      // silently fail
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex gap-6">
      {/* Main grid */}
      <div className={`flex-1 ${selected ? "max-w-[calc(100%-340px)]" : ""}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Media Library</h1>
            <p className="text-sm text-muted mt-1">{total} file{total !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search..."
              className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary w-48"
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted">Loading...</div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-muted">No media files yet.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => openDetail(item.id)}
                className={`group border rounded-xl overflow-hidden bg-surface text-left transition-all cursor-pointer ${
                  selected?.id === item.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <div className="aspect-square relative">
                  <img src={item.url} alt={item.alt || item.filename} className="w-full h-full object-cover" />
                </div>
                <div className="p-2">
                  <p className="text-xs text-foreground font-medium truncate">{item.filename}</p>
                  <p className="text-[10px] text-muted">
                    {item.width && item.height ? `${item.width}×${item.height}` : "—"} · {formatSize(item.size)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent disabled:opacity-30"
            >
              Previous
            </button>
            <span className="text-sm text-muted">Page {page} of {pages}</span>
            <button
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent disabled:opacity-30"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {(selected || detailLoading) && (
        <div className="w-80 shrink-0 bg-surface border border-border rounded-xl p-4 sticky top-6 self-start max-h-[calc(100vh-4rem)] overflow-y-auto">
          {detailLoading ? (
            <div className="flex items-center justify-center py-12 text-muted">Loading...</div>
          ) : selected ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground">Details</h2>
                <button
                  onClick={() => setSelected(null)}
                  className="text-muted hover:text-foreground text-xs"
                >
                  Close
                </button>
              </div>

              {/* Preview */}
              <div className="rounded-lg overflow-hidden bg-accent mb-4">
                <img src={selected.url} alt={selected.alt || selected.filename} className="w-full object-contain max-h-48" />
              </div>

              {/* Meta */}
              <div className="space-y-2 text-xs mb-4">
                <div className="flex justify-between">
                  <span className="text-muted">Filename</span>
                  <span className="text-foreground font-medium truncate ml-2 max-w-[60%]">{selected.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Dimensions</span>
                  <span className="text-foreground">{selected.width && selected.height ? `${selected.width}×${selected.height}` : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Size</span>
                  <span className="text-foreground">{formatSize(selected.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Format</span>
                  <span className="text-foreground">{selected.format || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Folder</span>
                  <span className="text-foreground">{selected.subfolder || "general"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Uploader</span>
                  <span className="text-foreground">{selected.uploadedBy?.name || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Uploaded</span>
                  <span className="text-foreground">{new Date(selected.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Alt text edit */}
              <div className="mb-4">
                <label className="text-xs font-medium text-foreground mb-1 block">Alt Text</label>
                <input
                  type="text"
                  value={editAlt}
                  onChange={(e) => setEditAlt(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Describe this image..."
                />
                {editAlt !== (selected.alt || "") && (
                  <button
                    onClick={handleSaveAlt}
                    disabled={saving}
                    className="mt-2 w-full px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Alt Text"}
                  </button>
                )}
              </div>

              {/* Usage */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-foreground mb-2">
                  Used In ({selected.usage?.length || 0})
                </h3>
                {selected.usage && selected.usage.length > 0 ? (
                  <div className="space-y-1">
                    {selected.usage.map((u, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs bg-accent rounded-lg px-2 py-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-primary/10 text-primary">
                          {u.type}
                        </span>
                        <span className="text-foreground truncate">{u.title}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted">Not used anywhere.</p>
                )}
              </div>

              {/* URL copy */}
              <div className="mb-4">
                <label className="text-xs font-medium text-foreground mb-1 block">URL</label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={selected.url}
                    readOnly
                    className="flex-1 bg-background border border-border rounded-lg px-2 py-1.5 text-[11px] text-muted font-mono"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(selected.url)}
                    className="px-2 py-1.5 text-xs border border-border rounded-lg hover:bg-accent"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Delete */}
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full px-3 py-2 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Delete Media
                </button>
              ) : (
                <div className="border border-red-200 rounded-lg p-3 bg-red-50">
                  <p className="text-xs text-red-700 mb-2">
                    {selected.usage && selected.usage.length > 0
                      ? `Warning: This image is used in ${selected.usage.length} place(s). Deleting it will break those references.`
                      : "Are you sure you want to delete this file permanently?"}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex-1 px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {deleting ? "Deleting..." : "Confirm Delete"}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-accent"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
