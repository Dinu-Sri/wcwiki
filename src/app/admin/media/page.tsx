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
  uploadedBy: { id: string; name: string | null };
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
    <div>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((item) => (
            <div key={item.id} className="group border border-border rounded-xl overflow-hidden bg-surface">
              <div className="aspect-square relative">
                <img src={item.url} alt={item.alt || item.filename} className="w-full h-full object-cover" />
              </div>
              <div className="p-2">
                <p className="text-xs text-foreground font-medium truncate">{item.filename}</p>
                <p className="text-[10px] text-muted">
                  {item.width && item.height ? `${item.width}×${item.height}` : "—"} · {formatSize(item.size)} · {item.format || "—"}
                </p>
                <p className="text-[10px] text-muted truncate">
                  {item.uploadedBy?.name || "Unknown"} · {item.subfolder || "general"}
                </p>
              </div>
            </div>
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
  );
}
