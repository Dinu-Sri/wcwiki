import Link from "next/link";

interface ArtistCardProps {
  slug: string;
  name: string;
  nationality?: string | null;
  birthYear?: number | null;
  deathYear?: number | null;
  bio?: string | null;
  styles?: string[];
  _formatted?: {
    name?: string;
    nationality?: string;
    bio?: string;
  };
}

export function ArtistCard({
  slug,
  name,
  nationality,
  birthYear,
  deathYear,
  bio,
  _formatted,
}: ArtistCardProps) {
  const lifespan =
    birthYear && deathYear
      ? `${birthYear}–${deathYear}`
      : birthYear
        ? `b. ${birthYear}`
        : null;

  const subtitle = [nationality, lifespan].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/artists/${slug}`}
      className="group block px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl hover:bg-card hover:shadow-sm transition-all duration-200"
    >
      {/* URL-style breadcrumb */}
      <div className="text-[11px] sm:text-xs text-primary mb-0.5 truncate">
        wcwiki.com › artists › {slug}
      </div>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-medium text-primary group-hover:underline leading-snug">
        {_formatted?.name ? (
          <span
            dangerouslySetInnerHTML={{ __html: _formatted.name }}
            className="[&_mark]:bg-warm/20 [&_mark]:rounded-sm"
          />
        ) : (
          name
        )}
        {subtitle && (
          <span className="text-muted font-normal text-xs sm:text-sm ml-1.5 sm:ml-2">— {subtitle}</span>
        )}
      </h3>

      {/* Description */}
      {(bio || _formatted?.bio) && (
        <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted line-clamp-2 leading-relaxed">
          {_formatted?.bio ? (
            <span
              dangerouslySetInnerHTML={{ __html: _formatted.bio }}
              className="[&_mark]:bg-warm/20 [&_mark]:rounded-sm"
            />
          ) : (
            bio
          )}
        </p>
      )}
    </Link>
  );
}
