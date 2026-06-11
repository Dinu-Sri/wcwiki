"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";

interface MetadataSuggestion {
  title?: string;
  description?: string;
  category?: string;
  country?: string;
  city?: string;
  tags?: string[];
}

type UploadField = "title" | "description" | "category" | "country" | "city" | "takenAt" | "tags";

interface UploadItem {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  description: string;
  category: string;
  country: string;
  city: string;
  takenAt: string;
  tags: string;
  suggesting: boolean;
}

function createUploadItem(file: File): UploadItem {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
    file,
    previewUrl: URL.createObjectURL(file),
    title: "",
    description: "",
    category: "",
    country: "",
    city: "",
    takenAt: "",
    tags: "",
    suggesting: false,
  };
}

export function PaintingReferenceUploadForm({
  categories,
  countries,
  defaultAttributionName,
}: {
  categories: string[];
  countries: string[];
  defaultAttributionName: string;
}) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [attributionName, setAttributionName] = useState(defaultAttributionName);
  const [attributionUrl, setAttributionUrl] = useState("");
  const [ownershipConfirmed, setOwnershipConfirmed] = useState(false);
  const [licenseConfirmed, setLicenseConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const itemsRef = useRef<UploadItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  function updateFiles(selected: FileList | null) {
    const next = Array.from(selected || []);
    const limited = next.slice(0, 10);

    if (next.length > 10) {
      setError("Upload a maximum of 10 images at a time.");
    } else {
      setError(null);
    }

    setItems((previous) => {
      previous.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return limited.map(createUploadItem);
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeItem(id: string) {
    setItems((previous) => {
      const removed = previous.find((item) => item.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return previous.filter((item) => item.id !== id);
    });
  }

  function updateItem(id: string, field: UploadField, value: string) {
    setItems((previous) =>
      previous.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  async function suggestMetadata(id: string) {
    setError(null);
    setSuccessCount(null);

    const item = items.find((entry) => entry.id === id);
    if (!item) {
      setError("Select an image before asking for AI suggestions.");
      return;
    }

    setItems((previous) =>
      previous.map((entry) => (entry.id === id ? { ...entry, suggesting: true } : entry))
    );
    try {
      const formData = new FormData();
      formData.append("file", item.file);

      const response = await fetch("/api/painting-references/suggest-metadata", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error || "AI suggestion failed.");
        return;
      }

      const suggestion = (payload.data || {}) as MetadataSuggestion;
      setItems((previous) =>
        previous.map((entry) => {
          if (entry.id !== id) return entry;
          return {
            ...entry,
            title: suggestion.title || entry.title,
            description: suggestion.description || entry.description,
            category:
              suggestion.category && categories.includes(suggestion.category)
                ? suggestion.category
                : entry.category,
            country:
              suggestion.country && countries.includes(suggestion.country)
                ? suggestion.country
                : entry.country,
            city: suggestion.city || entry.city,
            tags:
              Array.isArray(suggestion.tags) && suggestion.tags.length > 0
                ? suggestion.tags.join(", ")
                : entry.tags,
          };
        })
      );
    } catch {
      setError("AI suggestion failed. Please try again.");
    } finally {
      setItems((previous) =>
        previous.map((entry) => (entry.id === id ? { ...entry, suggesting: false } : entry))
      );
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessCount(null);

    if (items.length === 0) {
      setError("Select at least one image.");
      return;
    }
    const missingCategoryIndex = items.findIndex((item) => !item.category);
    if (missingCategoryIndex !== -1) {
      setError(`Choose a category for image ${missingCategoryIndex + 1}.`);
      return;
    }
    if (!ownershipConfirmed || !licenseConfirmed) {
      setError("Please confirm ownership and CC BY 4.0 publishing permission.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      items.forEach((item, index) => {
        formData.append("files", item.file);
        formData.append(`title_${index}`, item.title);
        formData.append(`description_${index}`, item.description);
        formData.append(`category_${index}`, item.category);
        formData.append(`country_${index}`, item.country);
        formData.append(`city_${index}`, item.city);
        formData.append(`takenAt_${index}`, item.takenAt);
        formData.append(`tags_${index}`, item.tags);
      });
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

      setSuccessCount(Array.isArray(data.data) ? data.data.length : items.length);
      setItems((previous) => {
        previous.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        return [];
      });
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
          ref={fileInputRef}
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

      {items.length > 0 && (
        <div className="space-y-5">
          {items.map((item, index) => (
            <section key={item.id} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-4 flex flex-col gap-4 sm:flex-row">
                <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-lg border border-border bg-accent">
                  <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-lg leading-none text-red-600 shadow-sm hover:bg-red-50"
                    aria-label={`Remove image ${index + 1}`}
                  >
                    x
                  </button>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Image {index + 1}</p>
                      <p className="break-all text-xs text-muted">{item.file.name}</p>
                      <p className="text-[11px] text-muted">{(item.file.size / 1024 / 1024).toFixed(1)}MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => suggestMetadata(item.id)}
                      disabled={item.suggesting}
                      className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/15 disabled:opacity-50"
                    >
                      {item.suggesting ? "Suggesting..." : "Suggest metadata with AI"}
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor={`reference-title-${item.id}`} className="mb-2 block text-sm font-medium text-foreground">
                        Title
                      </label>
                      <input
                        id={`reference-title-${item.id}`}
                        value={item.title}
                        onChange={(event) => updateItem(item.id, "title", event.target.value)}
                        placeholder="Misty lake morning"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label htmlFor={`reference-country-${item.id}`} className="mb-2 block text-sm font-medium text-foreground">
                        Country
                      </label>
                      <select
                        id={`reference-country-${item.id}`}
                        value={item.country}
                        onChange={(event) => updateItem(item.id, "country", event.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Select country</option>
                        {countries.map((countryName) => (
                          <option key={countryName} value={countryName}>
                            {countryName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Category
                    </label>
                    <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
                      {categories.map((categoryName) => (
                        <label
                          key={categoryName}
                          className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
                            item.category === categoryName
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-foreground hover:bg-accent"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`category-choice-${item.id}`}
                            value={categoryName}
                            checked={item.category === categoryName}
                            onChange={() => updateItem(item.id, "category", categoryName)}
                            className="sr-only"
                          />
                          <span className={`h-2.5 w-2.5 rounded-full ${item.category === categoryName ? "bg-primary" : "bg-border"}`} />
                          {categoryName}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor={`reference-city-${item.id}`} className="mb-2 block text-sm font-medium text-foreground">
                        City or place
                      </label>
                      <input
                        id={`reference-city-${item.id}`}
                        value={item.city}
                        onChange={(event) => updateItem(item.id, "city", event.target.value)}
                        placeholder="Kandy"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label htmlFor={`reference-date-${item.id}`} className="mb-2 block text-sm font-medium text-foreground">
                        Date taken
                      </label>
                      <input
                        id={`reference-date-${item.id}`}
                        type="date"
                        value={item.takenAt}
                        onChange={(event) => updateItem(item.id, "takenAt", event.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label htmlFor={`reference-description-${item.id}`} className="mb-2 block text-sm font-medium text-foreground">
                      Description
                    </label>
                    <textarea
                      id={`reference-description-${item.id}`}
                      value={item.description}
                      onChange={(event) => updateItem(item.id, "description", event.target.value)}
                      rows={3}
                      placeholder="Light direction, location, season, colors, or painting notes"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor={`reference-tags-${item.id}`} className="mb-2 block text-sm font-medium text-foreground">
                      Tags
                    </label>
                    <input
                      id={`reference-tags-${item.id}`}
                      value={item.tags}
                      onChange={(event) => updateItem(item.id, "tags", event.target.value)}
                      placeholder="clouds, lake, reflections"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      )}

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
          <span>I agree that approved images will be published under CC BY 4.0 with attribution, and wcWIKI may store, resize, optimize, and display them for platform features.</span>
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
