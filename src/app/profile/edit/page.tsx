"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const SPECIALIZATIONS = [
  "Watercolor",
  "Oil Painting",
  "Acrylic",
  "Gouache",
  "Ink Wash",
  "Mixed Media",
  "Botanical Art",
  "Landscape",
  "Portrait",
  "Abstract",
  "Plein Air",
  "Calligraphy",
  "Illustration",
];

const MEDIA_INTERESTS = [
  "Watercolor",
  "Oil",
  "Acrylic",
  "Gouache",
  "Ink",
  "Pastel",
  "Charcoal",
  "Graphite",
  "Digital",
  "Mixed Media",
];

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia",
  "Austria", "Bangladesh", "Belgium", "Brazil", "Cambodia", "Canada",
  "Chile", "China", "Colombia", "Czech Republic", "Denmark", "Egypt",
  "Finland", "France", "Germany", "Greece", "Hungary", "India", "Indonesia",
  "Iran", "Iraq", "Ireland", "Israel", "Italy", "Japan", "Jordan",
  "Kenya", "South Korea", "Malaysia", "Mexico", "Morocco", "Myanmar",
  "Nepal", "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan",
  "Peru", "Philippines", "Poland", "Portugal", "Romania", "Russia",
  "Saudi Arabia", "Singapore", "South Africa", "Spain", "Sri Lanka",
  "Sweden", "Switzerland", "Taiwan", "Thailand", "Turkey", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Vietnam",
];

interface ProfileData {
  name: string;
  bio: string;
  country: string;
  website: string;
  socialLinks: Record<string, string> | null;
  specializations: string[];
  mediaInterests: string[];
  watercolorStartYear: number | null;
  portfolioImages: string[];
  image: string | null;
  completeness: { score: number; missing: string[] };
}

export default function ProfileEditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [website, setWebsite] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    youtube: "",
    x: "",
    facebook: "",
    pinterest: "",
    behance: "",
  });
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [customSpecialization, setCustomSpecialization] = useState("");
  const [mediaInterests, setMediaInterests] = useState<string[]>([]);
  const [watercolorStartYear, setWatercolorStartYear] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setName(data.name || "");
        setBio(data.bio || "");
        setCountry(data.country || "");
        setWebsite(data.website || "");
        setProfileImage(data.image || null);
        if (data.socialLinks) {
          setSocialLinks({
            instagram: data.socialLinks.instagram || "",
            youtube: data.socialLinks.youtube || "",
            x: data.socialLinks.x || "",
            facebook: data.socialLinks.facebook || "",
            pinterest: data.socialLinks.pinterest || "",
            behance: data.socialLinks.behance || "",
          });
        }
        setSpecializations(data.specializations || []);
        setMediaInterests(data.mediaInterests || []);
        setWatercolorStartYear(
          data.watercolorStartYear != null ? String(data.watercolorStartYear) : ""
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router, fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          country,
          website,
          socialLinks,
          specializations,
          mediaInterests,
          watercolorStartYear: watercolorStartYear
            ? parseInt(watercolorStartYear)
            : null,
          image: profileImage,
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Profile saved successfully!" });
        fetchProfile();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to save" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("subfolder", "profiles");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setProfileImage(data.url);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to upload image." });
      }
    } catch {
      setMessage({ type: "error", text: "Upload failed." });
    }
    setUploadingImage(false);
    e.target.value = "";
  };

  const addCustomSpecialization = () => {
    const trimmed = customSpecialization.trim();
    if (trimmed && !specializations.includes(trimmed)) {
      setSpecializations([...specializations, trimmed]);
    }
    setCustomSpecialization("");
  };

  const toggleChip = (
    value: string,
    list: string[],
    setter: (v: string[]) => void
  ) => {
    if (list.includes(value)) {
      setter(list.filter((v) => v !== value));
    } else {
      setter([...list, value]);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Edit Profile</h1>

      {/* Completeness bar */}
      {profile?.completeness && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-muted">Profile completeness</span>
            <span className="font-semibold text-primary">
              {profile.completeness.score}%
            </span>
          </div>
          <div className="h-2 bg-accent rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${profile.completeness.score}%` }}
            />
          </div>
          {profile.completeness.missing.length > 0 && (
            <p className="text-xs text-muted mt-1.5">
              Missing: {profile.completeness.missing.join(", ")}
            </p>
          )}
        </div>
      )}

      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
          {message.type === "success" && (
            <button
              onClick={() => router.push("/dashboard")}
              className="ml-3 text-green-700 font-medium underline hover:no-underline"
            >
              Go to Dashboard →
            </button>
          )}
        </div>
      )}

      <div className="space-y-6">
        {/* Avatar with upload */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-accent border-2 border-border group">
            {profileImage ? (
              <Image
                src={profileImage}
                alt={name || "Profile"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl text-muted">
                {name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploadingImage}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              {uploadingImage ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
          <div>
            <p className="text-sm font-medium">{session.user?.email}</p>
            <p className="text-xs text-muted capitalize">
              {(session.user as { role?: string })?.role?.toLowerCase().replace("_", " ")}
            </p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs text-primary hover:underline mt-1"
            >
              Change photo
            </button>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Display Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
            placeholder="Your display name"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Bio *</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-y"
            placeholder="Tell us about yourself and your watercolor journey…"
          />
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Country *
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
          >
            <option value="">Select your country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Year started watercolor */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Year Started Watercolor
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1940"
              max={new Date().getFullYear()}
              value={watercolorStartYear}
              onChange={(e) => setWatercolorStartYear(e.target.value)}
              className="w-32 px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
              placeholder={`e.g. ${new Date().getFullYear() - 5}`}
            />
            {watercolorStartYear && (
              <span className="text-sm text-muted">
                ({new Date().getFullYear() - parseInt(watercolorStartYear)} years of experience)
              </span>
            )}
          </div>
        </div>

        {/* Specializations */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Specializations *
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {SPECIALIZATIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() =>
                  toggleChip(s, specializations, setSpecializations)
                }
                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                  specializations.includes(s)
                    ? "bg-primary text-white border-primary"
                    : "bg-card text-foreground border-border hover:border-primary/50"
                }`}
              >
                {s}
              </button>
            ))}
            {/* Custom specializations (not in preset list) */}
            {specializations
              .filter((s) => !SPECIALIZATIONS.includes(s))
              .map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    toggleChip(s, specializations, setSpecializations)
                  }
                  className="px-3 py-1.5 rounded-full text-sm border transition-all bg-primary text-white border-primary"
                >
                  {s} ×
                </button>
              ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customSpecialization}
              onChange={(e) => setCustomSpecialization(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomSpecialization();
                }
              }}
              className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
              placeholder="Add custom specialization…"
            />
            <button
              type="button"
              onClick={addCustomSpecialization}
              className="px-3 py-1.5 text-sm bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {/* Media interests */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Media Interests *
          </label>
          <div className="flex flex-wrap gap-2">
            {MEDIA_INTERESTS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() =>
                  toggleChip(m, mediaInterests, setMediaInterests)
                }
                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                  mediaInterests.includes(m)
                    ? "bg-warm text-white border-warm"
                    : "bg-card text-foreground border-border hover:border-warm/50"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Website</label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
            placeholder="https://your-portfolio.com"
          />
        </div>

        {/* Social links */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Social Links
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(socialLinks).map(([key, value]) => (
              <div key={key}>
                <label className="text-xs text-muted capitalize mb-1 block">
                  {key === "x" ? "X (Twitter)" : key}
                </label>
                <input
                  type="url"
                  value={value}
                  onChange={(e) =>
                    setSocialLinks((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                  placeholder={`https://${key === "x" ? "x" : key}.com/…`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : "Save Profile"}
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2.5 text-muted hover:text-foreground text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
