"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface UserProfile {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
  bio: string | null;
  website: string | null;
  socialLinks: Record<string, string> | null;
  country: string | null;
  specializations: string[];
  mediaInterests: string[];
  watercolorStartYear: number | null;
  portfolioImages: string[];
  isArtist: boolean;
  artistVerified: boolean;
  createdAt: string;
}

const ROLE_LABELS: Record<string, string> = {
  USER: "Member",
  EDITOR: "Editor",
  APPROVER: "Approver",
  SUPER_ADMIN: "Administrator",
};

const ROLE_COLORS: Record<string, string> = {
  USER: "bg-gray-100 text-gray-700",
  EDITOR: "bg-blue-100 text-blue-700",
  APPROVER: "bg-purple-100 text-purple-700",
  SUPER_ADMIN: "bg-red-100 text-red-700",
};

export default function ProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/profile/${id}`);
        if (res.ok) {
          setProfile(await res.json());
        } else {
          const data = await res.json();
          setError(data.error || "Failed to load profile");
        }
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-bold mb-2">Profile Not Available</h1>
        <p className="text-muted">{error || "User not found"}</p>
        <Link
          href="/dashboard"
          className="inline-block mt-4 text-primary hover:underline text-sm"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start gap-5 mb-8">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-accent border-2 border-border shrink-0">
          {profile.image ? (
            <Image
              src={profile.image}
              alt={profile.name || "User"}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl text-muted">
              {profile.name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{profile.name || "Anonymous"}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[profile.role] || ROLE_COLORS.USER}`}
            >
              {ROLE_LABELS[profile.role] || profile.role}
            </span>
            {profile.isArtist && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-warm/10 text-warm">
                Artist{profile.artistVerified ? " ✓" : ""}
              </span>
            )}
            {profile.country && (
              <span className="text-sm text-muted">{profile.country}</span>
            )}
          </div>
          {profile.watercolorStartYear != null && (
            <p className="text-sm text-muted mt-1">
              {new Date().getFullYear() - profile.watercolorStartYear} years of experience (since {profile.watercolorStartYear})
            </p>
          )}
          <p className="text-xs text-muted/60 mt-1">
            Member since{" "}
            {new Date(profile.createdAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">
            About
          </h2>
          <p className="text-foreground leading-relaxed whitespace-pre-line">
            {profile.bio}
          </p>
        </div>
      )}

      {/* Specializations & Media */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        {profile.specializations.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">
              Specializations
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {profile.specializations.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary border border-primary/20"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
        {profile.mediaInterests.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">
              Media Interests
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {profile.mediaInterests.map((m) => (
                <span
                  key={m}
                  className="px-2.5 py-1 rounded-full text-xs bg-warm/10 text-warm border border-warm/20"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Portfolio gallery */}
      {profile.portfolioImages.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
            Portfolio
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {profile.portfolioImages.map((img, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-lg overflow-hidden bg-accent border border-border"
              >
                <Image
                  src={img}
                  alt={`Portfolio ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {(profile.website || profile.socialLinks) && (
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-2">
            Links
          </h2>
          <div className="flex flex-wrap gap-3">
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Website
              </a>
            )}
            {profile.socialLinks &&
              Object.entries(profile.socialLinks)
                .filter(([, url]) => url)
                .map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline capitalize"
                  >
                    {platform === "x" ? "X (Twitter)" : platform}
                  </a>
                ))}
          </div>
        </div>
      )}
    </div>
  );
}
