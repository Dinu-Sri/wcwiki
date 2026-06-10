"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface PreviewFile {
  name: string;
  size: number;
  url: string;
}

export function PaintingReferenceUploadForm({
  categories,
  defaultAttributionName,
}: {
  categories: CategoryOption[];
  defaultAttributionName: string;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [attributionName, setAttributionName] = useState(defaultAttributionName);
  const [attributionUrl, setAttributionUrl] = useState("");
  const [ownershipConfirmed, setOwnershipConfirmed] = useState(false);
  const [licenseConfirmed, setLicenseConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  useEffect(() => {
    const next = files.map((file) => ({
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
    }));
    setPreviews(next);
    return () => next.forEach((file) => URL.revokeObjectURL(file.url));
  }, [files]);

  function updateFiles(selected: FileList | null) {
    const next = Array.from(selected || []);
    if (next.length > 10) {
      setError("Upload a maximum of 10 images at a time.");
      setFiles(next.slice(0, 10));
      return;
    }
    setError(null);
    setFiles(next);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessCount(null);

    if (files.length === 0) {
      setError("Select at least one image.");
      return;
    }
    if (!ownershipConfirmed || !licenseConfirmed) {
      setError("Please confirm ownership and CC BY 4.0 publishing permission.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("tags", tags);
      formData.append("attributionName", attributionName);
      formData.append("attributionUrl", attributionUrl);
      formData.append("ownershipConfirmed", String(ownershipConfirmed));
      formData.append("licenseConfirmed", String(licenseConfirmed));

      const response = await fetch("/api/painting-references", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Upload failed.");
        return;
      }

      setSuccessCount(Array.isArray(data.data) ? data.data.length : files.length);
      setFiles([]);
      setTitle("");
      setDescription("");
      setTags("");
      setOwnershipConfirmed(false);
      setLicenseConfirmed(false);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {successCount !== null && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {successCount} painting reference{successCount === 1 ? "" : "s"} submitted for approval.{" "}
          <Link href="/dashboard" className="font-medium underline">
            View status
          </Link>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Images
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          onChange={(event) => updateFiles(event.target.files)}
          className="block w-full text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-primary/90"
        />
        <p className="mt-2 text-xs text-muted">
          Up to 10 images, 10MB each. Approved references are optimized before publishing.
        </p>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {previews.map((file) => (
            <div key={file.url} className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="aspect-square bg-accent">
                <img src={file.url} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="px-2 py-2">
                <p className="truncate text-xs font-medium text-foreground">{file.name}</p>
                <p className="text-[10px] text-muted">{(file.size / 1024 / 1024).toFixed(1)}MB</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="reference-title" className="block text-sm font-medium text-foreground mb-2">
            Title
          </label>
          <input
            id="reference-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Misty lake morning"
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="reference-category" className="block text-sm font-medium text-foreground mb-2">
            Category
          </label>
          <input
            id="reference-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            list="reference-categories"
            placeholder="Landscape"
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <datalist id="reference-categories">
            {categories.map((item) => (
              <option key={item.id} value={item.name} />
            ))}
          </datalist>
        </div>
      </div>

      <div>
        <label htmlFor="reference-description" className="block text-sm font-medium text-foreground mb-2">
          Description
        </label>
        <textarea
          id="reference-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          placeholder="Light direction, location, season, colors, or painting notes"
          className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label htmlFor="reference-tags" className="block text-sm font-medium text-foreground mb-2">
          Tags
        </label>
        <input
          id="reference-tags"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="clouds, lake, reflections"
          className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="attribution-name" className="block text-sm font-medium text-foreground mb-2">
            Attribution name
          </label>
          <input
            id="attribution-name"
            value={attributionName}
            onChange={(event) => setAttributionName(event.target.value)}
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="attribution-url" className="block text-sm font-medium text-foreground mb-2">
            Attribution URL
          </label>
          <input
            id="attribution-url"
            value={attributionUrl}
            onChange={(event) => setAttributionUrl(event.target.value)}
            placeholder="https://..."
            className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
        <label className="flex gap-3 text-sm text-muted">
          <input
            type="checkbox"
            checked={ownershipConfirmed}
            onChange={(event) => setOwnershipConfirmed(event.target.checked)}
            className="mt-1"
          />
          <span>I own these photos or have permission to share them on wcWIKI.</span>
        </label>
        <label className="flex gap-3 text-sm text-muted">
          <input
            type="checkbox"
            checked={licenseConfirmed}
            onChange={(event) => setLicenseConfirmed(event.target.checked)}
            className="mt-1"
          />
          <span>I agree that approved images will be published under CC BY 4.0 with attribution.</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit for Approval"}
      </button>
    </form>
  );
}
