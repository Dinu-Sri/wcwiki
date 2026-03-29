"use client";

import { useState, useEffect, useCallback } from "react";

interface SiteSettings {
  siteName: string;
  siteDescription: string | null;
  siteUrl: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  foundedYear: number | null;
  founderName: string | null;
  socialFacebook: string | null;
  socialInstagram: string | null;
  socialX: string | null;
  socialYoutube: string | null;
  socialPinterest: string | null;
  socialLinkedin: string | null;
  googleSiteVerification: string | null;
  googleAnalyticsId: string | null;
  googleTagManagerId: string | null;
  bingSiteVerification: string | null;
  pinterestVerification: string | null;
  yandexVerification: string | null;
  defaultOgImage: string | null;
  robotsCustomRules: string | null;
}

const defaultSettings: SiteSettings = {
  siteName: "wcWIKI",
  siteDescription: null,
  siteUrl: "https://wcwiki.com",
  logoUrl: null,
  faviconUrl: null,
  foundedYear: 2025,
  founderName: null,
  socialFacebook: null,
  socialInstagram: null,
  socialX: null,
  socialYoutube: null,
  socialPinterest: null,
  socialLinkedin: null,
  googleSiteVerification: null,
  googleAnalyticsId: null,
  googleTagManagerId: null,
  bingSiteVerification: null,
  pinterestVerification: null,
  yandexVerification: null,
  defaultOgImage: null,
  robotsCustomRules: null,
};

type TabId = "identity" | "tracking" | "seo" | "schema";

export default function AdminSeoPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState<TabId>("identity");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/seo")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setSettings(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save");
      } else {
        setSettings(data);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }, [settings]);

  const update = (field: keyof SiteSettings, value: string | number | null) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "identity", label: "Site Identity" },
    { id: "tracking", label: "Tracking & Verification" },
    { id: "seo", label: "Default SEO" },
    { id: "schema", label: "Schema Preview" },
  ];

  // Generate Organization schema preview
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteName,
    url: settings.siteUrl,
    ...(settings.logoUrl && { logo: { "@type": "ImageObject", url: settings.logoUrl } }),
    ...(settings.siteDescription && { description: settings.siteDescription }),
    ...(settings.foundedYear && { foundingDate: String(settings.foundedYear) }),
    ...(settings.founderName && { founder: { "@type": "Person", name: settings.founderName } }),
    sameAs: [
      settings.socialFacebook,
      settings.socialInstagram,
      settings.socialX,
      settings.socialYoutube,
      settings.socialPinterest,
      settings.socialLinkedin,
    ].filter(Boolean),
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.siteName,
    url: settings.siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${settings.siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">SEO Settings</h1>
          <p className="text-sm text-muted mt-1">
            Manage site identity, tracking codes, structured data, and default SEO settings.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || activeTab === "schema"}
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : saved ? "✓ Saved" : "Save Changes"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface rounded-lg p-1 border border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-card border border-border rounded-xl p-6">
        {activeTab === "identity" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Site Identity</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Site Name" value={settings.siteName} onChange={(v) => update("siteName", v)} />
              <Field label="Site URL" value={settings.siteUrl} onChange={(v) => update("siteUrl", v)} placeholder="https://wcwiki.com" />
              <Field label="Logo URL" value={settings.logoUrl || ""} onChange={(v) => update("logoUrl", v || null)} placeholder="https://..." />
              <Field label="Favicon URL" value={settings.faviconUrl || ""} onChange={(v) => update("faviconUrl", v || null)} placeholder="https://..." />
              <Field label="Founded Year" value={settings.foundedYear ? String(settings.foundedYear) : ""} onChange={(v) => update("foundedYear", v ? parseInt(v, 10) : null)} type="number" />
              <Field label="Founder Name" value={settings.founderName || ""} onChange={(v) => update("founderName", v || null)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Site Description</label>
              <textarea
                value={settings.siteDescription || ""}
                onChange={(e) => update("siteDescription", e.target.value || null)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
                rows={3}
                placeholder="A community-driven encyclopedia for watercolor art..."
              />
            </div>

            <h3 className="text-base font-semibold text-foreground mt-6 pt-4 border-t border-border">Social Profiles</h3>
            <p className="text-sm text-muted -mt-4">Used for Organization schema (Knowledge Panel) and footer links.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Facebook" value={settings.socialFacebook || ""} onChange={(v) => update("socialFacebook", v || null)} placeholder="https://facebook.com/..." />
              <Field label="Instagram" value={settings.socialInstagram || ""} onChange={(v) => update("socialInstagram", v || null)} placeholder="https://instagram.com/..." />
              <Field label="X (Twitter)" value={settings.socialX || ""} onChange={(v) => update("socialX", v || null)} placeholder="https://x.com/..." />
              <Field label="YouTube" value={settings.socialYoutube || ""} onChange={(v) => update("socialYoutube", v || null)} placeholder="https://youtube.com/..." />
              <Field label="Pinterest" value={settings.socialPinterest || ""} onChange={(v) => update("socialPinterest", v || null)} placeholder="https://pinterest.com/..." />
              <Field label="LinkedIn" value={settings.socialLinkedin || ""} onChange={(v) => update("socialLinkedin", v || null)} placeholder="https://linkedin.com/..." />
            </div>
          </div>
        )}

        {activeTab === "tracking" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Tracking & Verification</h2>

            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Google</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field
                    label="Search Console Verification"
                    value={settings.googleSiteVerification || ""}
                    onChange={(v) => update("googleSiteVerification", v || null)}
                    placeholder="content value from meta tag"
                    help="The content value from the verification meta tag."
                  />
                  <Field
                    label="Analytics ID (GA4)"
                    value={settings.googleAnalyticsId || ""}
                    onChange={(v) => update("googleAnalyticsId", v || null)}
                    placeholder="G-XXXXXXXXXX"
                    help="Your GA4 measurement ID."
                  />
                  <Field
                    label="Tag Manager ID"
                    value={settings.googleTagManagerId || ""}
                    onChange={(v) => update("googleTagManagerId", v || null)}
                    placeholder="GTM-XXXXXXX"
                    help="Your GTM container ID."
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-foreground mb-3">Other Search Engines</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field
                    label="Bing Verification"
                    value={settings.bingSiteVerification || ""}
                    onChange={(v) => update("bingSiteVerification", v || null)}
                    placeholder="Verification content value"
                  />
                  <Field
                    label="Pinterest Verification"
                    value={settings.pinterestVerification || ""}
                    onChange={(v) => update("pinterestVerification", v || null)}
                    placeholder="Verification content value"
                  />
                  <Field
                    label="Yandex Verification"
                    value={settings.yandexVerification || ""}
                    onChange={(v) => update("yandexVerification", v || null)}
                    placeholder="Verification content value"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "seo" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Default SEO</h2>

            <Field
              label="Default OG Image"
              value={settings.defaultOgImage || ""}
              onChange={(v) => update("defaultOgImage", v || null)}
              placeholder="https://..."
              help="Fallback Open Graph image used when content pages don't have their own."
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Additional Robots Rules</label>
              <textarea
                value={settings.robotsCustomRules || ""}
                onChange={(e) => update("robotsCustomRules", e.target.value || null)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none font-mono"
                rows={4}
                placeholder="Disallow: /private/&#10;Allow: /public/"
              />
              <p className="text-xs text-muted mt-1">Additional rules appended to robots.txt (one per line).</p>
            </div>
          </div>
        )}

        {activeTab === "schema" && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">Schema Preview</h2>
            <p className="text-sm text-muted mb-4">
              These JSON-LD schemas are automatically injected into every page. Fill in the Site Identity tab to populate them.
            </p>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Organization Schema</h3>
              <p className="text-xs text-muted mb-2">Triggers Google Knowledge Panel for your brand.</p>
              <pre className="bg-surface border border-border rounded-lg p-4 text-xs text-foreground overflow-x-auto font-mono leading-relaxed">
                {JSON.stringify(orgSchema, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">WebSite Schema with SearchAction</h3>
              <p className="text-xs text-muted mb-2">Enables sitelinks search box in Google results.</p>
              <pre className="bg-surface border border-border rounded-lg p-4 text-xs text-foreground overflow-x-auto font-mono leading-relaxed">
                {JSON.stringify(webSiteSchema, null, 2)}
              </pre>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Content page schemas</strong> (Person, VisualArtwork, Article, BreadcrumbList, ItemList) are generated automatically from content data and injected on their respective pages.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  help,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  help?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
      />
      {help && <p className="text-xs text-muted mt-1">{help}</p>}
    </div>
  );
}
