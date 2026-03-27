import Link from "next/link";

interface ArtistCardProps {
  slug: string;
  name: string;
  nationality?: string | null;
  birthYear?: number | null;
  deathYear?: number | null;
  image?: string | null;
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
  image,
  styles,
  _formatted,
}: ArtistCardProps) {
  const lifespan =
    birthYear && deathYear
      ? `${birthYear}–${deathYear}`
      : birthYear
        ? `b. ${birthYear}`
        : null;

  return (
    <Link
      href={`/artists/${slug}`}
      className="group block bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-[var(--shadow)] hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* Image or placeholder */}
      <div className="aspect-[4/3] bg-accent overflow-hidden relative">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-light to-accent">
            <svg className="w-12 h-12 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )}
        {/* Subtle overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200 leading-snug">
          {_formatted?.name ? (
            <span
              dangerouslySetInnerHTML={{ __html: _formatted.name }}
              className="[&_mark]:bg-warm/20 [&_mark]:rounded-sm"
            />
          ) : (
            name
          )}
        </h3>
        <div className="mt-1.5 text-sm text-muted flex items-center gap-1.5">
          {nationality && <span>{nationality}</span>}
          {nationality && lifespan && <span className="text-border">·</span>}
          {lifespan && <span className="tabular-nums">{lifespan}</span>}
        </div>
        {styles && styles.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {styles.slice(0, 3).map((style) => (
              <span
                key={style}
                className="px-2.5 py-0.5 text-[11px] bg-primary-light text-primary rounded-full font-medium"
              >
                {style}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
