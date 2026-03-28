"use client";

import { useState, useEffect, useCallback } from "react";
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
  yearsOfExperience: number | null;
  portfolioImages: string[];
  image: string | null;
  completeness: { score: number; missing: string[] };
}

export default function ProfileEditPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  const [mediaInterests, setMediaInterests] = useState<string[]>([]);
  const [yearsOfExperience, setYearsOfExperience] = useState("");

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
        setYearsOfExperience(
          data.yearsOfExperience != null ? String(data.yearsOfExperience) : ""
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
          yearsOfExperience: yearsOfExperience
            ? parseInt(yearsOfExperience)
            : null,
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
        </div>
      )}

      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-accent border-2 border-border">
            {profile?.image ? (
              <Image
                src={profile.image}
                alt={name || "Profile"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl text-muted">
                {name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium">{session.user?.email}</p>
            <p className="text-xs text-muted capitalize">
              {(session.user as { role?: string })?.role?.toLowerCase().replace("_", " ")}
            </p>
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

        {/* Years of experience */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Years of Experience
          </label>
          <input
            type="number"
            min="0"
            max="80"
            value={yearsOfExperience}
            onChange={(e) => setYearsOfExperience(e.target.value)}
            className="w-32 px-3 py-2 rounded-lg border border-border bg-card text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
            placeholder="e.g. 5"
          />
        </div>

        {/* Specializations */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Specializations *
          </label>
          <div className="flex flex-wrap gap-2">
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
