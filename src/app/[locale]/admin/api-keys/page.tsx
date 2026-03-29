"use client";

import { useEffect, useState } from "react";

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  enabled: boolean;
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  token?: string; // Only present on creation
  user?: { name: string | null; email: string | null };
}

export default function AdminApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPerms, setNewPerms] = useState<string[]>(["read"]);
  const [creating, setCreating] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/api-keys")
      .then((r) => r.json())
      .then((data) => {
        setKeys(data);
        setLoading(false);
      });
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, permissions: newPerms }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewToken(data.token);
        setKeys((prev) => [data, ...prev]);
        setNewName("");
        setNewPerms(["read"]);
      }
    } catch {
      // silently fail
    }
    setCreating(false);
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    const res = await fetch(`/api/admin/api-keys/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !enabled }),
    });
    if (res.ok) {
      setKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, enabled: !enabled } : k))
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this API key permanently?")) return;
    const res = await fetch(`/api/admin/api-keys/${id}`, { method: "DELETE" });
    if (res.ok) {
      setKeys((prev) => prev.filter((k) => k.id !== id));
    }
  };

  const togglePerm = (perm: string) => {
    setNewPerms((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">API Keys</h1>
          <p className="text-sm text-muted mt-1">
            Manage API keys for external access
          </p>
        </div>
        <button
          onClick={() => { setShowCreate(!showCreate); setNewToken(null); }}
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90"
        >
          {showCreate ? "Cancel" : "Create Key"}
        </button>
      </div>

      {/* New token display */}
      {newToken && (
        <div className="mb-6 bg-green-50 border border-green-300 rounded-xl p-4">
          <p className="text-sm font-semibold text-green-800 mb-2">
            API Key Created — Copy it now, it won&apos;t be shown again!
          </p>
          <div className="flex gap-2">
            <code className="flex-1 bg-green-100 rounded-lg px-3 py-2 text-sm text-green-900 font-mono break-all">
              {newToken}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(newToken);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="px-4 py-2 text-sm bg-green-700 text-white rounded-lg hover:bg-green-600"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {/* Create form */}
      {showCreate && !newToken && (
        <div className="mb-6 bg-surface border border-border rounded-xl p-4">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Key Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., AI Content Agent"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Permissions</label>
              <div className="flex gap-3">
                {["read", "write", "delete"].map((perm) => (
                  <label key={perm} className="flex items-center gap-1.5 text-sm text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPerms.includes(perm)}
                      onChange={() => togglePerm(perm)}
                      className="rounded"
                    />
                    {perm}
                  </label>
                ))}
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create API Key"}
            </button>
          </div>
        </div>
      )}

      {/* Keys list */}
      {keys.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center text-muted">
          No API keys yet. Create one to get started.
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <div
              key={key.id}
              className={`bg-surface border rounded-xl p-4 ${
                key.enabled ? "border-border" : "border-red-200/30 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">{key.name}</span>
                    <code className="text-xs bg-accent rounded px-1.5 py-0.5 text-muted font-mono">
                      {key.keyPrefix}...
                    </code>
                    {!key.enabled && (
                      <span className="text-[10px] px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                        Disabled
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span>Permissions: {key.permissions.join(", ")}</span>
                    <span>·</span>
                    <span>Created {new Date(key.createdAt).toLocaleDateString()}</span>
                    {key.lastUsedAt && (
                      <>
                        <span>·</span>
                        <span>Last used {new Date(key.lastUsedAt).toLocaleDateString()}</span>
                      </>
                    )}
                    {key.expiresAt && (
                      <>
                        <span>·</span>
                        <span>Expires {new Date(key.expiresAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(key.id, key.enabled)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      key.enabled
                        ? "border-amber-400 text-amber-800 bg-amber-50 hover:bg-amber-100"
                        : "border-green-400 text-green-800 bg-green-50 hover:bg-green-100"
                    }`}
                  >
                    {key.enabled ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => handleDelete(key.id)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
